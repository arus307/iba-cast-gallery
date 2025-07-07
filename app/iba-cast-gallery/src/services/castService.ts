import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastDto, PostDto } from '@iba-cast-gallery/types';
import { notFound } from "next/navigation";

/**
 * 有効なキャスト情報を全件取得する (idの昇順で返却)
 */
export async function getActiveCasts(): Promise<CastDto[]> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.find({
        where: {
            isActive: true,
        },
        order: {
            id: "ASC",
        }
    });

    return casts.map((cast) => ({
        id: cast.id,
        name: cast.name,
        enName: cast.enName,
        type: cast.type,
        introduceTweetId: cast.introduceTweetId,
        taggedPosts: [],
    }));
}

// TODO ここに書くのが適切か検討したい
export type CastDetailDto = Pick<CastDto, "id" | "name" | "enName" | "type" | "introduceTweetId"> & {
    taggedPosts: Array<Pick<PostDto, "id" | "postedAt"> & {
        taggedCasts: Pick<CastDto, "id" |"name"|"enName">[];
    }>;
};


/**
 * 指定のキャストの英名からキャスト情報(タグ付けされたポストも含む)を取得
 * @param castEnName キャストの英名
 */
export async function getCastDetail(castEnName:string): Promise<CastDetailDto> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const cast = await castRepository.findOne({
        where: {
            isActive: true,
            enName: castEnName
        },
        order: {
            id: "ASC",
        },
        relations: {
            postCastTags: {
                post: {
                    castTags:true,
                },
            },
        }
    });

    if (!cast) {
        notFound();
    }

    return {
        id: cast.id,
        name: cast.name,
        enName: cast.enName,
        type: cast.type,
        introduceTweetId: cast.introduceTweetId,
        taggedPosts: cast.taggedPosts.map(post=>{
            return {
                id: post.id,
                postedAt: post.postedAt,
                taggedCasts: post.castTags.sort((a, b) => a.order - b.order).map((castTag) => ({
                    id: castTag.castid,
                    name: castTag.cast.name,
                    enName: castTag.cast.enName,
                })),
            };
        }),
    };
}