import 'reflect-metadata';
import { initializeDatabase,appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";
import { PostDto } from '@iba-cast-gallery/types';

/**
 * 有効なポスト情報を全件取得する
 */
export async function getExistsPosts(): Promise<PostDto[]> {
    await initializeDatabase();

    const postRepository:Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        where:{
            isDeleted: false,
        },
        relations:["taggedCasts"],
    });

    console.log("posts:", posts);

    return posts.map((post) => ({
        id: post.id,
        postedAt: post.postedAt,
        taggedCasts: post.taggedCasts.map((cast) => cast.id),
    }));
}