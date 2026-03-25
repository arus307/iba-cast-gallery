import "server-only";
import "reflect-metadata";
import { initializeDatabase, appDataSource } from "../data-source";
import { Post, Repository, Shift } from "@iba-cast-gallery/dao";
import { ShiftSlot, ShiftSourceStatus, CastType, ShiftGroup } from "@iba-cast-gallery/types";
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
            } else if (existing.shiftSource !== ShiftSourceStatus.DONE) {
                await postRepository.update(sourcePostId, {
                    shiftSource: ShiftSourceStatus.PENDING,
                });
                logger.info({ sourcePostId }, "シフト元ポスト shift_source=pending に更新");
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
 */
export async function updateShiftSource(
    date: string,
    slot: ShiftSlot,
    sourcePostId: string,
): Promise<void> {
    await initializeDatabase();
    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    await shiftRepository.update({ date, shift: slot }, { sourcePostId });
    logger.info({ date, slot, sourcePostId }, "シフトソース更新");
}

/**
 * 全シフトデータを一覧表示用に取得する（date+shift でグループ化、日付降順）
 */
export async function getShiftList(): Promise<ShiftGroup[]> {
    await initializeDatabase();

    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    const records = await shiftRepository.find({
        relations: ["cast"],
        order: { date: "DESC", shift: "ASC", castId: "ASC" },
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
