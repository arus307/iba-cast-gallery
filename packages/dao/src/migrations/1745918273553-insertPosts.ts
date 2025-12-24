// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1745918273553 implements MigrationInterface {

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
            id: "1916689034728128905",
            postedAt: "2025-04-28T12:00:00+09:00",
            taggedCastIds: [6, 36, 19, 30, 25],
        },
        {
            id: "1916797510217351649",
            postedAt: "2025-04-28T19:11:00+09:00",
            taggedCastIds: [35, 3, 7],
        },
        {
            id: "1917057688460267747",
            postedAt: "2025-04-29T12:25:00+09:00",
            taggedCastIds: [37, 4, 24, 12, 13],
        },
    ];
