// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Cast } from "../entities/Cast";
import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1745501143243 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Obsolete: consolidated into 1800000000000-consolidatePostSeedData.ts
        /*
        const casts: Cast[] = await queryRunner.manager.find("casts");
        // id指定になっているcastをインスタンスに設定
        const posts: Post[] = basePosts.map((basePost) => {
            const post = new Post();
            post.id = basePost.id;
            post.postedAt = basePost.postedAt;
            post.taggedCasts = basePost.taggedCastIds.map(castId => {
                const cast = casts.find(c => c.id === castId);
                if (!cast) {
                    throw new Error(`Cast with id ${castId} not found`);
                }
                return cast;
            });
            post.isDeleted = false;
            return post;
        });
        await queryRunner.manager.save(posts);
        */

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Obsolete: consolidated into 1800000000000-consolidatePostSeedData.ts
        /*
        const idsToDelete = basePosts.map(p => p.id);
        await queryRunner.manager.createQueryBuilder()
            .delete()
            .from(Post)
            .where("id IN (:...ids)", { ids: idsToDelete })
            .execute();
        */
    }
}


const basePosts: {
    id: string;
    postedAt: string;
    taggedCastIds: number[];
}[] = [
        {
            id: "1914514500432154700",
            postedAt: "2025-04-22T12:00:00+09:00",
            taggedCastIds: [34, 1, 20, 13, 15],
        },
        {
            id: "1915240068828319816",
            postedAt: "2025-04-23T12:03:00+09:00",
            taggedCastIds: [7, 6, 37, 20, 15, 17],
        }
    ]