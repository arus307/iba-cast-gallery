import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";

/**
 * ポスト情報を全件取得する
 */
export async function getAllPosts(): Promise<Post[]> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        relations: ["taggedCasts"],
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
 */
export async function registerPost(post: Post): Promise<void> {
    await initializeDatabase();
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    postRepository.save(post);
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
        relations: ["taggedCasts"],
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