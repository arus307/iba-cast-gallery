import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { PostCastTag, Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";
import { Logger } from '@iba-cast-gallery/logger';

/**
 * ポスト情報を全件取得する
 */
export async function getAllPosts(logger: Logger): Promise<Post[]> {
    const childLogger = logger.child({service: 'postService', function: 'getAllPosts'});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        order: {
            postedAt: "DESC",
        },
    });
    childLogger.info({ count: posts.length }, 'サービス呼び出し終了');
    return posts;
}

/**
 * ポスト情報を登録する
 * 
 * @param request 登録するポスト情報
 * @return 登録されたポスト情報
 */
export async function registerPost(logger: Logger, post: Post): Promise<void> {
    const childLogger = logger.child({service: 'postService', function: 'registerPost', postId: post.id});
    childLogger.info('サービス呼び出し開始');

    await initializeDatabase();

    await appDataSource.transaction(async (transactionalEntityManager) => {
        const postRepository: Repository<Post> = transactionalEntityManager.getRepository(Post);
        const postCastTagRepository: Repository<PostCastTag> = transactionalEntityManager.getRepository(PostCastTag);

        const isExists = await postRepository.findOne({
            where: { id: post.id },
        });

        if(isExists) {
            childLogger.info({ post: post.id }, '既存ポスト更新');
            postRepository.update(post.id, post);
            childLogger.info({ post: post.id },`ポスト更新完了`);
        } else {
            childLogger.info({ post: post.id }, '新規ポスト登録');
            postRepository.insert(post);
            childLogger.info({ post: post.id },`ポスト登録完了`);
        }

        childLogger.info({ postId: post.id }, '既存キャストタグ削除');
        await postCastTagRepository.delete({ postId: post.id }); // 既存のキャストタグを削除
        childLogger.info({ postId: post.id }, `既存のキャストタグ削除完了`);

        const postCastTags = post.castTags.map((castTag) => ({
                postId: post.id,
                castid: castTag.castid,
                order: castTag.order,
            }));

        if (postCastTags.length > 0) {
            childLogger.info({ count: postCastTags.length }, '新規キャストタグ登録');
            await postCastTagRepository.insert(postCastTags);
            childLogger.info({ count: postCastTags.length }, `タグ登録完了`);
        }
    });
    childLogger.info('サービス呼び出し終了');
}

/**
 * 指定のポストIDのポストを取得する
 * @param postId ポストID
 */
export async function getPostById(logger: Logger, postId: string): Promise<Post | null> {
    const childLogger = logger.child({service: 'postService', function: 'getPostById', postId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const post = await postRepository.findOne({
        where: { id: postId },
    });
    childLogger.info({ found: !!post }, 'サービス呼び出し終了');
    return post;
}

/**
 * 指定のポストIDのポストを削除する(物理削除)
 * @param postId ポストID
 */
export async function deletePostById(logger: Logger, postId: string): Promise<boolean> {
    const childLogger = logger.child({service: 'postService', function: 'deletePostById', postId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const result = await postRepository.delete(postId);
    const success = result.affected !== 0;
    childLogger.info({ success }, 'サービス呼び出し終了');
    return success;
}