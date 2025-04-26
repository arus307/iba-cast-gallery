import { Cast } from "../entities/Cast";
import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertPosts1745645058483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const casts : Cast[] = await queryRunner.manager.find("casts");
        // id指定になっているcastをインスタンスに設定
        const posts : Post[] = basePosts.map((basePost)=>{
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
    id:string;
    postedAt:string;
    taggedCastIds: number[];
}[] = [
    {
        id: "1915631882144014477",
        postedAt: "2025-04-25T14:00:00+09:00",
        taggedCastIds: [6, 37, 25, 16, 13],
    },
    {
        id: "1915969731032707300",
        postedAt: "2025-04-26T12:22:00+09:00",
        taggedCastIds: [36, 4, 25, 11, 16],
    }
];