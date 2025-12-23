// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1745236447444 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Obsolete: consolidated into 1800000000000-consolidatePostSeedData.ts
        /*
        const casts: Cast[] = await queryRunner.manager.find("casts");

        // id指定になっているcastをインスタンスに設定
        const posts: Post[] = basePosts.map((basePost) => {
            const post = new Post();
            post.id = basePost.id;
            post.postedAt = basePost.postedAt;
            post.isDeleted = false;
            post.castTags = basePost.taggedCastIds.map((castId, index) => {
                const cast = casts.find(c => c.id === castId);
                if (!cast) {
                    throw new Error(`Cast with id ${castId} not found`);
                }
                const postCastTag = new (require("../entities/PostCastTag").PostCastTag);
                postCastTag.cast = cast;
                postCastTag.order = index;
                return postCastTag;
            });
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
            id: "1914154099953877491",
            postedAt: "2025-04-21T12:07:00+09:00",
            taggedCastIds: [36, 4, 13, 25, 24,],
        }
    ];
