import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { PostCastTag, Repository } from "@iba-cast-gallery/dao";
import { PostContentType } from "@iba-cast-gallery/types";
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
