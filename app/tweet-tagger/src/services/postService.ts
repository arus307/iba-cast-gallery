import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";
import { PostDto } from '@iba-cast-gallery/types';

/**
 * ポスト情報を全件取得する
 */
export async function getWholePosts(): Promise<PostDto[]> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        relations: ["taggedCasts"],
    });


    return posts.map((post) => ({
        id: post.id,
        postedAt: post.postedAt,
        taggedCasts: post.taggedCasts.map((cast) => cast.id),
    }));
}
