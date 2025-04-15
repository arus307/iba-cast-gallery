import 'reflect-metadata';
import { initializeDatabase,appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Post } from "@iba-cast-gallery/dao";

/**
 * 有効なポスト情報を全件返却するAPI
 */
export async function GET() {
    await initializeDatabase();

    const postRepository:Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.find({
        where:{
            isDeleted: false,
        },
        relations:["taggedCasts"],
    });

    return Response.json(posts);
}