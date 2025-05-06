// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Post } from "../entities/Post";
import { Cast } from "../entities/Cast";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1744807288406 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const idsToDelete = basePosts.map(p => p.id);
        await queryRunner.manager.createQueryBuilder()
            .delete()
            .from(Post)
            .where("id IN (:...ids)", { ids: idsToDelete })
            .execute();
    }

}


const basePosts: {
    id: string;
    postedAt: string;
    taggedCastIds: number[];
}[] = [

        {
            id: "1909442405776113834",
            postedAt: "2025-04-08T12:05:00+09:00",
            taggedCastIds: [37, 4, 22, 16, 15]
        },
        {
            id: "1910166462553358624",
            postedAt: "2025-04-10T12:02:00+09:00",
            taggedCastIds: [36, 6, 29, 22, 15]
        },
        {
            id: "1910533159294558531",
            postedAt: "2025-04-11T12:19:00+09:00",
            taggedCastIds: [36, 37, 25, 17, 31]
        },
        {
            id: "1910615238145171504",
            postedAt: "2025-04-11T17:45:00+09:00",
            taggedCastIds: [1, 37, 3, 16, 19, 13]
        },
        {
            id: "1910891740443414615",
            postedAt: "2025-04-12T12:04:00+09:00",
            taggedCastIds: [37, 8, 18, 11, 27]
        },
        {
            id: "1911253566117081478",
            postedAt: "2025-04-13T12:02:00+09:00",
            taggedCastIds: [8, 35]
        },
        {
            id: "1911615405011112273",
            postedAt: "2025-04-14T12:00:00+09:00",
            taggedCastIds: [1, 36]
        },
        {
            id: "1911721093628567673",
            postedAt: "2025-04-14T19:00:00+09:00",
            taggedCastIds: [35]
        },
        {
            id: "1911977941090877490",
            postedAt: "2025-04-15T12:00:00+09:00",
            taggedCastIds: [37, 4, 20, 15, 13]
        },
        {
            id: "1912043473416724579",
            postedAt: "2025-04-15T16:21:00+09:00",
            taggedCastIds: [1, 37, 4, 3, 25, 11, 12]
        },
        {
            id: "1912083488758792543",
            postedAt: "2025-04-15T19:00:00+09:00",
            taggedCastIds: [36]
        },
        {
            id: "1912445864242757802",
            postedAt: "2025-04-16T19:00:00+09:00",
            taggedCastIds: [37]
        },
    ]
