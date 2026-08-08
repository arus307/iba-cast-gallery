import "server-only";
import "reflect-metadata";
import { initializeDatabase, appDataSource } from "../data-source";
import { Post, Repository, Shift } from "@iba-cast-gallery/dao";
import {
    ShiftSlot,
    ShiftSourceStatus,
    CastType,
    PostContentType,
} from "@iba-cast-gallery/types";
import type { ShiftGroup, ShiftPostCandidate } from "@iba-cast-gallery/types";
import { inferShiftFromPostedAt } from "utils/shift";
import logger from "../logger";

const SHIFT_LABEL: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const DAY_LABEL: Record<string, string> = {
    Mon: "月", Tue: "火", Wed: "水", Thu: "木",
    Fri: "金", Sat: "土", Sun: "日",
};

const SHIFT_TARGET_TIME: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "12:00:00",
    [ShiftSlot.EVENING]: "17:30:00",
    [ShiftSlot.NIGHT]: "19:00:00",
};

const SHIFT_CANDIDATE_LIMIT = 8;
const SHIFT_CANDIDATE_QUERY_LIMIT = 40;

/**
 * 未登録シフトの情報源候補を、同じ日本時間の日付に投稿された
 * 未使用のギャラリーポストから近い順で取得する。
 */
export async function getShiftPostCandidates(
    date: string,
    slot: ShiftSlot,
): Promise<ShiftPostCandidate[]> {
    await initializeDatabase();

    const target = new Date(`${date}T${SHIFT_TARGET_TIME[slot]}+09:00`);
    const dayStart = new Date(`${date}T00:00:00+09:00`);
    const nextDayStart = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);

    // content_type + posted_at の既存複合インデックスを使えるよう、
    // 日付範囲で先に候補を限定してからアプリ側で距離順に並べる。
    const posts = await postRepository
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.castTags", "castTag")
        .leftJoinAndSelect("castTag.cast", "cast")
        .where("post.contentType = :contentType", {
            contentType: PostContentType.GALLERY,
        })
        .andWhere("post.postedAt >= :dayStart", {
            dayStart: dayStart.toISOString(),
        })
        .andWhere("post.postedAt < :nextDayStart", {
            nextDayStart: nextDayStart.toISOString(),
        })
        .andWhere("post.isDeleted = false")
        .andWhere("(post.showInGallery = true OR castTag.postId IS NOT NULL)")
        .andWhere("post.shiftSource IS NULL")
        .andWhere("post.excludeFromShiftRegistration = false")
        .orderBy("post.postedAt", "DESC")
        .take(SHIFT_CANDIDATE_QUERY_LIMIT)
        .getMany();

    return posts
        .map((post): ShiftPostCandidate | null => {
            const inferredShift = inferShiftFromPostedAt(post.postedAt);
            const postedAt = new Date(post.postedAt);
            if (!inferredShift || Number.isNaN(postedAt.getTime())) {
                return null;
            }

            return {
                id: post.id,
                postedAt: post.postedAt,
                inferredShift: inferredShift.slot,
                differenceMinutes: Math.round(
                    Math.abs(postedAt.getTime() - target.getTime()) / 60000,
                ),
                taggedCasts: [...(post.castTags ?? [])]
                    .sort((a, b) => a.order - b.order)
                    .map((tag) => ({
                        id: tag.cast.id,
                        name: tag.cast.name,
                        order: tag.order,
                    })),
            };
        })
        .filter((candidate): candidate is ShiftPostCandidate => candidate !== null)
        .sort((a, b) => {
            const slotComparison =
                Number(b.inferredShift === slot) - Number(a.inferredShift === slot);
            return slotComparison !== 0
                ? slotComparison
                : a.differenceMinutes - b.differenceMinutes;
        })
        .slice(0, SHIFT_CANDIDATE_LIMIT);
}

/**
 * 指定日・シフトの記録を取得する
 */
export async function getShiftRecord(
    date: string,
    slot: ShiftSlot,
): Promise<{ castIds: number[]; sourcePostId: string | null }> {
    await initializeDatabase();

    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    const records = await shiftRepository.find({
        where: { date, shift: slot },
    });

    return {
        castIds: records.map((r) => r.castId),
        sourcePostId: records[0]?.sourcePostId ?? null,
    };
}

/**
 * 指定日・シフトのキャストを保存する（既存レコードを洗い替え）
 *
 * sourcePostId が指定された場合:
 *   - posts テーブルに upsert（新規なら shift_source=pending/show_in_gallery=false）
 *   - 既存ポストの show_in_gallery や shift_source=done は上書きしない
 */
export async function saveShifts(
    date: string,
    slot: ShiftSlot,
    castIds: number[],
    sourcePostId: string | null,
): Promise<void> {
    await initializeDatabase();

    await appDataSource.transaction(async (em) => {
        // ① source post の upsert
        if (sourcePostId) {
            const postRepository: Repository<Post> = em.getRepository(Post);
            const existing = await postRepository.findOne({ where: { id: sourcePostId } });

            if (!existing) {
                await postRepository.insert({
                    id: sourcePostId,
                    postedAt: new Date().toISOString(),
                    isDeleted: false,
                    showInGallery: false,
                    shiftSource: ShiftSourceStatus.PENDING,
                });
                logger.info({ sourcePostId }, "シフト元ポスト新規登録");
            } else {
                await postRepository.update(sourcePostId, {
                    shiftSource:
                        existing.shiftSource === ShiftSourceStatus.DONE
                            ? ShiftSourceStatus.DONE
                            : ShiftSourceStatus.PENDING,
                    excludeFromShiftRegistration: false,
                });
                logger.info(
                    { sourcePostId },
                    "シフト元ポストの登録状態を更新",
                );
            }
        }

        // ② 既存シフトレコードを削除
        const shiftRepository: Repository<Shift> = em.getRepository(Shift);
        await shiftRepository.delete({ date, shift: slot });

        // ③ 新しいシフトレコードを挿入
        if (castIds.length > 0) {
            const records = castIds.map((castId) => ({
                date,
                shift: slot,
                castId,
                sourcePostId: sourcePostId ?? null,
            }));
            await shiftRepository.insert(records);
            logger.info({ date, slot, castIds }, "シフト登録完了");
        }
    });
}

/**
 * 指定日・シフトの source_post_id を更新する
 *
 * posts テーブルに対象ポストが存在しない場合は先に新規登録し、
 * 外部キー制約違反を防ぐ。
 */
export async function updateShiftSource(
    date: string,
    slot: ShiftSlot,
    sourcePostId: string,
): Promise<void> {
    await initializeDatabase();

    await appDataSource.transaction(async (em) => {
        // ① source post の upsert（saveShifts と同じロジック）
        const postRepository: Repository<Post> = em.getRepository(Post);
        const existing = await postRepository.findOne({ where: { id: sourcePostId } });

        if (!existing) {
            await postRepository.insert({
                id: sourcePostId,
                postedAt: new Date().toISOString(),
                isDeleted: false,
                showInGallery: false,
                shiftSource: ShiftSourceStatus.PENDING,
            });
            logger.info({ sourcePostId }, "シフト元ポスト新規登録（ソース後付け）");
        } else {
            await postRepository.update(sourcePostId, {
                shiftSource:
                    existing.shiftSource === ShiftSourceStatus.DONE
                        ? ShiftSourceStatus.DONE
                        : ShiftSourceStatus.PENDING,
                excludeFromShiftRegistration: false,
            });
            logger.info(
                { sourcePostId },
                "シフト元ポストの登録状態を更新（ソース後付け）",
            );
        }

        // ② shifts の source_post_id を更新
        const shiftRepository: Repository<Shift> = em.getRepository(Shift);
        await shiftRepository.update({ date, shift: slot }, { sourcePostId });
        logger.info({ date, slot, sourcePostId }, "シフトソース更新");
    });
}

/**
 * 全シフトデータを一覧表示用に取得する（date+shift でグループ化）
 * ソート順: 日付降順 → 同日内は夜→夕方→オープン → キャストID昇順
 */
export async function getShiftList(): Promise<ShiftGroup[]> {
    await initializeDatabase();

    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    const records = await shiftRepository.find({
        relations: ["cast"],
        order: { date: "DESC", castId: "ASC" },
    });

    // 同じ日付内でのシフト表示順: 夜(1) → 夕方(2) → オープン(3)
    const SHIFT_ORDER: Record<ShiftSlot, number> = {
        [ShiftSlot.NIGHT]: 1,
        [ShiftSlot.EVENING]: 2,
        [ShiftSlot.OPEN]: 3,
    };

    records.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return SHIFT_ORDER[a.shift] - SHIFT_ORDER[b.shift];
        // castId は find() の order: { castId: "ASC" } で保証済み（安定ソート）
    });

    const groupMap = new Map<string, ShiftGroup>();
    for (const r of records) {
        const key = `${r.date}__${r.shift}`;
        if (!groupMap.has(key)) {
            const d = new Date(r.date);
            const dayEn = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Tokyo" });
            groupMap.set(key, {
                date: r.date,
                dayOfWeek: DAY_LABEL[dayEn] ?? dayEn,
                shift: r.shift,
                casts: [],
                sourcePostId: r.sourcePostId ?? null,
            });
        }
        groupMap.get(key)!.casts.push({
            id: r.castId,
            name: r.cast.name,
            type: r.cast.type === CastType.REAL ? "RC" : "IC",
        });
    }

    return Array.from(groupMap.values());
}

/**
 * 全シフトデータを CSV エクスポート用に取得する
 */
export async function getAllShiftsForExport(): Promise<
    { date: string; dayOfWeek: string; shift: string; castType: string; name: string }[]
> {
    await initializeDatabase();

    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    const records = await shiftRepository.find({
        relations: ["cast"],
        order: { date: "ASC", shift: "ASC", castId: "ASC" },
    });

    return records.map((r) => {
        const d = new Date(r.date);
        const dayEn = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Tokyo" });
        return {
            date: r.date,
            dayOfWeek: DAY_LABEL[dayEn] ?? dayEn,
            shift: SHIFT_LABEL[r.shift],
            castType: r.cast.type === CastType.REAL ? "RC" : "IC",
            name: r.cast.name,
        };
    });
}
