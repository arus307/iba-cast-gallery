import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastDto, PostDto } from '@iba-cast-gallery/types';
import { notFound } from "next/navigation";
import { Logger } from "@iba-cast-gallery/logger";

/**
 * 有効なキャスト情報を全件取得する (idの昇順で返却)
 */
export async function getActiveCasts(logger: Logger): Promise<CastDto[]> {
    const childLogger = logger.child({service: 'castService', function: 'getActiveCasts'});
    childLogger.info('サービス呼び出し開始');
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

    childLogger.info({ count: casts.length }, 'サービス呼び出し終了');
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
export async function getCastDetail(logger: Logger, castEnName:string): Promise<CastDetailDto> {
    const childLogger = logger.child({service: 'castService', function: 'getCastDetail', castEnName});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const cast = await castRepository.findOne({
        where: {
            isActive: true,
            enName: castEnName,
            postCastTags: {
                post: {
                    isDeleted: false,
                }
            }

        },
        order: {
            postCastTags:{
                post: {
                    postedAt: "DESC",
                },
                order: "ASC",
            },
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
        childLogger.warn('キャストが見つかりません。notFound()をスローします。');
        notFound();
    }

    childLogger.info({ found: !!cast }, 'サービス呼び出し終了');
    return {
        id: cast.id,
        name: cast.name,
        enName: cast.enName,
        type: cast.type,
        introduceTweetId: cast.introduceTweetId,
        taggedPosts: cast.postCastTags.map(postCastTag => {
            const post = postCastTag.post;
            return {
                id: post.id,
                postedAt: post.postedAt,
                taggedCasts: post.castTags.sort((a, b) => a.order - b.order).map((castTag) => ({
                    id: castTag.cast.id,
                    name: castTag.cast.name,
                    enName: castTag.cast.enName,
                })),
            };
        }),
    };
}