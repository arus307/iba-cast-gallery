import { Cast } from "../entities/Cast";
import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1746260661499 implements MigrationInterface {

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
            id: "1918141989624979829",
            postedAt: "2025-05-02T12:14:00+09:00",
            taggedCastIds: [36, 37, 22, 25, 17],
        },
        {
            id: "1918502746790994094",
            postedAt: "2025-05-03T12:07:00+09:00",
            taggedCastIds: [8, 36, 37, 24, 19, 22],
        },
    ];
