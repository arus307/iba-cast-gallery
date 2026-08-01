import "server-only";
import "reflect-metadata";
import { Cast, Post, PostCastTag, Repository, Shift } from "@iba-cast-gallery/dao";
import {
    PostContentType,
    PostRegistrationRequest,
    PostRegistrationResult,
    ShiftSlot,
    ShiftSourceStatus,
} from "@iba-cast-gallery/types";
import { appDataSource, initializeDatabase } from "../data-source";
import logger from "../logger";
import { extractPostId, getPostCreatedAtFromId } from "../utils/postId";
import { inferShiftFromPostedAt } from "../utils/shift";

export class PostRegistrationValidationError extends Error {}

const uniqueIds = (ids: number[]) => Array.from(new Set(ids));

const isValidDateString = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

function validateRequest(request: PostRegistrationRequest) {
    if (extractPostId(request.postId) !== request.postId) {
        throw new PostRegistrationValidationError("ポストIDが不正です");
    }
    const isBlog = request.destinations?.blog === true;
    const hasContentDestination = request.destinations?.gallery || isBlog;

    if (!hasContentDestination && !request.destinations?.shift) {
        throw new PostRegistrationValidationError("登録先を1つ以上選択してください");
    }
    if (request.destinations?.gallery && isBlog) {
        throw new PostRegistrationValidationError(
            "ギャラリーとBLOGを同時には登録できません",
        );
    }
    if (isBlog && request.destinations?.shift) {
        throw new PostRegistrationValidationError(
            "BLOGとシフトを同時には登録できません",
        );
    }
    if (
        !Array.isArray(request.taggedCastIds) ||
        !Array.isArray(request.shiftCastIds)
    ) {
        throw new PostRegistrationValidationError("キャストの指定が不正です");
    }
    if (
        [...request.taggedCastIds, ...request.shiftCastIds].some(
            (id) => !Number.isInteger(id) || id <= 0,
        )
    ) {
        throw new PostRegistrationValidationError("キャストIDが不正です");
    }
    if (request.postedAt && Number.isNaN(new Date(request.postedAt).getTime())) {
        throw new PostRegistrationValidationError("投稿日時が不正です");
    }
    if (request.destinations.shift && request.shiftCastIds.length === 0) {
        throw new PostRegistrationValidationError(
            "シフト登録するキャストを選択してください",
        );
    }
    if (
        hasContentDestination &&
        request.destinations.shift &&
        request.taggedCastIds.some(
            (castId) => !request.shiftCastIds.includes(castId),
        )
    ) {
        throw new PostRegistrationValidationError(
            "写真タグのキャストは出勤キャストにも含めてください",
        );
    }
    if (request.shift?.date && !isValidDateString(request.shift.date)) {
        throw new PostRegistrationValidationError("シフト日付が不正です");
    }
    if (
        request.shift?.slot &&
        !Object.values(ShiftSlot).includes(request.shift.slot)
    ) {
        throw new PostRegistrationValidationError("シフト枠が不正です");
    }
}

/**
 * ギャラリーまたはBLOGのタグ付けとシフト登録を、選択された登録先だけまとめて保存する。
 */
export async function registerPostWithDestinations(
    request: PostRegistrationRequest,
): Promise<PostRegistrationResult> {
    validateRequest(request);
    await initializeDatabase();

    const isBlog = request.destinations.blog === true;
    const hasContentDestination = request.destinations.gallery || isBlog;
    const taggedCastIds = hasContentDestination
        ? uniqueIds(request.taggedCastIds)
        : [];
    const shiftCastIds = request.destinations.shift
        ? uniqueIds(request.shiftCastIds)
        : [];
    const usedCastIds = uniqueIds([...taggedCastIds, ...shiftCastIds]);

    return appDataSource.transaction(async (em) => {
        if (usedCastIds.length > 0) {
            const castRepository: Repository<Cast> = em.getRepository(Cast);
            const casts = await castRepository
                .createQueryBuilder("cast")
                .select("cast.id")
                .where("cast.id IN (:...castIds)", { castIds: usedCastIds })
                .getMany();
            if (casts.length !== usedCastIds.length) {
                throw new PostRegistrationValidationError(
                    "存在しないキャストが含まれています",
                );
            }
        }

        const postRepository: Repository<Post> = em.getRepository(Post);
        const existing = await postRepository.findOne({
            where: { id: request.postId },
        });
        const postedAt =
            request.postedAt ??
            existing?.postedAt ??
            getPostCreatedAtFromId(request.postId)?.toISOString() ??
            new Date().toISOString();
        const inferredShift = inferShiftFromPostedAt(postedAt);

        if (request.destinations.shift && inferredShift === null) {
            throw new PostRegistrationValidationError(
                "投稿日時からシフトを判定できません",
            );
        }

        const shift = request.destinations.shift
            ? {
                date: request.shift?.date ?? inferredShift!.date,
                slot: request.shift?.slot ?? inferredShift!.slot,
            }
            : null;

        const postValues = {
            postedAt,
            isDeleted: request.isDeleted ?? existing?.isDeleted ?? false,
            showInGallery: hasContentDestination
                ? true
                : existing?.showInGallery ?? false,
            contentType: hasContentDestination
                ? isBlog
                    ? PostContentType.BLOG
                    : PostContentType.GALLERY
                : existing?.contentType ?? PostContentType.GALLERY,
            shiftSource: request.destinations.shift
                ? existing?.shiftSource === ShiftSourceStatus.DONE
                    ? ShiftSourceStatus.DONE
                    : ShiftSourceStatus.PENDING
                : existing?.shiftSource ?? null,
        };

        if (existing) {
            await postRepository.update(request.postId, postValues);
        } else {
            await postRepository.insert({
                id: request.postId,
                ...postValues,
            });
        }

        if (hasContentDestination) {
            const postCastTagRepository: Repository<PostCastTag> =
                em.getRepository(PostCastTag);
            await postCastTagRepository.delete({ postId: request.postId });

            if (taggedCastIds.length > 0) {
                await postCastTagRepository.insert(
                    taggedCastIds.map((castId, index) => ({
                        postId: request.postId,
                        castid: castId,
                        order: index + 1,
                    })),
                );
            }
        }

        if (shift) {
            const shiftRepository: Repository<Shift> = em.getRepository(Shift);
            await shiftRepository.delete({ sourcePostId: request.postId });
            await shiftRepository.delete({
                date: shift.date,
                shift: shift.slot,
            });
            await shiftRepository.insert(
                shiftCastIds.map((castId) => ({
                    date: shift.date,
                    shift: shift.slot,
                    castId,
                    sourcePostId: request.postId,
                })),
            );
        }

        logger.info(
            {
                postId: request.postId,
                destinations: request.destinations,
                taggedCastIds,
                shiftCastIds,
                shift,
            },
            "ポストのコンテンツ・シフト登録完了",
        );

        return {
            postId: request.postId,
            shift,
        };
    });
}
