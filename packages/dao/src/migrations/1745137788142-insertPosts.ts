// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Post } from "../entities/Post";
import { Cast } from "../entities/Cast";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1745137788142 implements MigrationInterface {

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
            id: "1912702844660322443",
            postedAt: "2025-04-17T12:01:00+09:00",
            taggedCastIds: [34, 6, 24, 13, 15],
        },
        {
            id: "1912830902922580054",
            postedAt: "2025-04-17T12:01:00+09:00",
            taggedCastIds: [34],
        },
        {
            id: "1913066864655380630",
            postedAt: "2025-04-18T12:07:00+09:00",
            taggedCastIds: [37, 3, 6, 15, 33, 17],
        },
        {
            id: "1913122044335870356",
            postedAt: "2025-04-18T15:46:00+09:00",
            taggedCastIds: [1, 7, 3, 24, 19, 25],
        },
        {
            id: "1913427640385757594",
            postedAt: "2025-04-19T12:01:00+09:00",
            taggedCastIds: [37, 6, 30, 16, 12],
        },
        {
            id: "1913791315378102533",
            postedAt: "2025-04-20T12:06:00+09:00",
            taggedCastIds: [37, 4, 24, 12],
        }
    ];
