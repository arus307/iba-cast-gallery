import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { PostCastTag, Repository, Shift } from "@iba-cast-gallery/dao";
import {
    PostContentType,
    ShiftSlot,
} from "@iba-cast-gallery/types";
import type { PostManagementSummary } from "@iba-cast-gallery/types";
import { Post } from "@iba-cast-gallery/dao";
import logger from "../logger";
import { getPostCreatedAtFromId } from "utils/postId";

/**
 * ポスト情報を全件取得する
 */
export async function getAllPosts(): Promise<Post[]> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        order: {
            postedAt: "DESC",
        },
    });

    return posts;
}

/**
 * 管理画面向けに、ポストへ登録されている用途・タグ・シフトをまとめて取得する。
 */
export async function getPostManagementSummaries(): Promise<PostManagementSummary[]> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const shiftRepository: Repository<Shift> = appDataSource.getRepository(Shift);
    const [posts, shifts] = await Promise.all([
        postRepository.find({ order: { postedAt: "DESC" } }),
        shiftRepository
            .createQueryBuilder("shift")
            .leftJoinAndSelect("shift.cast", "cast")
            .where("shift.sourcePostId IS NOT NULL")
            .orderBy("shift.date", "DESC")
            .addOrderBy("shift.castId", "ASC")
            .getMany(),
    ]);

    const shiftOrder: Record<ShiftSlot, number> = {
        [ShiftSlot.NIGHT]: 1,
        [ShiftSlot.EVENING]: 2,
        [ShiftSlot.OPEN]: 3,
    };
    const dayLabels: Record<string, string> = {
        Sun: "日",
        Mon: "月",
        Tue: "火",
        Wed: "水",
        Thu: "木",
        Fri: "金",
        Sat: "土",
    };
    const shiftsByPost = new Map<string, PostManagementSummary["shifts"]>();

    for (const shift of shifts) {
        if (!shift.sourcePostId) {
            continue;
        }

        const postShifts = shiftsByPost.get(shift.sourcePostId) ?? [];
        let usage = postShifts.find(
            (item) => item.date === shift.date && item.shift === shift.shift,
        );
        if (!usage) {
            const date = new Date(`${shift.date}T00:00:00+09:00`);
            const dayOfWeek = date.toLocaleDateString("en-US", {
                weekday: "short",
                timeZone: "Asia/Tokyo",
            });
            usage = {
                date: shift.date,
                dayOfWeek: dayLabels[dayOfWeek] ?? dayOfWeek,
                shift: shift.shift,
                casts: [],
            };
            postShifts.push(usage);
            shiftsByPost.set(shift.sourcePostId, postShifts);
        }
        usage.casts.push({ id: shift.castId, name: shift.cast.name });
    }

    for (const postShifts of shiftsByPost.values()) {
        postShifts.sort((a, b) => {
            const dateComparison = b.date.localeCompare(a.date);
            return dateComparison !== 0
                ? dateComparison
                : shiftOrder[a.shift] - shiftOrder[b.shift];
        });
    }

    return posts.map((post) => ({
        id: post.id,
        postedAt: post.postedAt,
        isDeleted: post.isDeleted,
        showInGallery: post.showInGallery,
        contentType: post.contentType,
        shiftSource: post.shiftSource,
        taggedCasts: [...(post.castTags ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((tag) => ({
                id: tag.cast.id,
                name: tag.cast.name,
                type: tag.cast.type,
                order: tag.order,
            })),
        shifts: shiftsByPost.get(post.id) ?? [],
    }));
}

/**
 * ポスト情報を登録する
 * 
 * @param request 登録するポスト情報
 * @return 登録されたポスト情報
 */
export async function registerPost(post: Post): Promise<void> {
    await initializeDatabase();

    await appDataSource.transaction(async (transactionalEntityManager) => {
        const postRepository: Repository<Post> = transactionalEntityManager.getRepository(Post);
        const postCastTagRepository: Repository<PostCastTag> = transactionalEntityManager.getRepository(PostCastTag);

        const isExists = await postRepository.findOne({
            where: { id: post.id },
        });

        if(isExists) {
            await postRepository.update(post.id, {
                postedAt: post.postedAt,
                isDeleted: post.isDeleted,
                showInGallery: post.showInGallery,
                contentType: post.contentType,
                shiftSource: post.shiftSource,
            });
            logger.info({post},`ポスト更新完了`);
        } else {
            await postRepository.insert(post);
            logger.info({post},`ポスト登録完了`);
        }

        await postCastTagRepository.delete({ postId: post.id }); // 既存のキャストタグを削除
        logger.info({post}, `既存のキャストタグ削除完了 (postId: ${post.id})`);

        const postCastTags = post.castTags.map((castTag) => ({
                postId: post.id,
                castid: castTag.castid,
                order: castTag.order,
            }));

        // 空配列の insert は TypeORM エラーになるためガードする
        if (postCastTags.length > 0) {
            await postCastTagRepository.insert(postCastTags);
        }

        logger.info({postCastTags}, `タグ登録完了 (postId: ${post.id})`);
    });
}

/**
 * 未登録のポストをギャラリー非公開のドラフトとして保存する。
 *
 * 既存ポストは公開状態やタグを含めて一切変更しない。
 * これにより、公開済みポストを再共有してもドラフトへ戻らない。
 */
export async function ensureDraftPost(postId: string): Promise<Post> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const postedAt = getPostCreatedAtFromId(postId)?.toISOString()
        ?? new Date().toISOString();

    await postRepository
        .createQueryBuilder()
        .insert()
        .into(Post)
        .values({
            id: postId,
            postedAt,
            isDeleted: false,
            showInGallery: false,
            contentType: PostContentType.GALLERY,
            shiftSource: null,
        })
        .orIgnore()
        .execute();

    const post = await postRepository.findOne({
        where: { id: postId },
    });

    if (post === null) {
        throw new Error(`ドラフトの保存に失敗しました (postId: ${postId})`);
    }

    logger.info({ postId, showInGallery: post.showInGallery }, `共有ポストのドラフト保存完了`);
    return post;
}

/**
 * 指定のポストIDのポストを取得する
 * @param postId ポストID
 */
export async function getPostById(postId: string): Promise<Post | null> {
    await initializeDatabase();
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const post = await postRepository.findOne({
        where: { id: postId },
    });

    return post;
}

/**
 * 指定のポストIDのポストを削除する(物理削除)
 * @param postId ポストID
 */
export async function deletePostById(postId: string): Promise<boolean> {
    await initializeDatabase();
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const result = await postRepository.delete(postId);

    return result.affected !== 0;
}
