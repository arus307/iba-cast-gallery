import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { PostCastTag, Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";
import logger from "../logger";

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

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);

    const isExists = await postRepository.findOne({
        where: { id: post.id },
    });

    if(isExists) {
        postRepository.update(post.id, post);
        logger.info({post},`ポスト更新完了`);
    } else {
        postRepository.insert(post);
        logger.info({post},`ポスト登録完了`);
    }

    const postCastTagRepository: Repository<PostCastTag> = appDataSource.getRepository(PostCastTag);

    postCastTagRepository.delete({ postId: post.id }); // 既存のキャストタグを削除
    logger.info({post}, `既存のキャストタグ削除完了 (postId: ${post.id})`);

    const postCastTags = post.castTags.map((castTag) => ({
            postId: post.id,
            castid: castTag.castid,
            order: castTag.order,
        }));
    postCastTagRepository.insert(postCastTags);

    logger.info({postCastTags}, `タグ登録完了 (postId: ${post.id})`);
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