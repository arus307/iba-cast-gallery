import "server-only"; // このモジュールがサーバーサイド専用であることを明示 (任意だが推奨)
import 'reflect-metadata';
import { initializeDatabase,appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastDto } from '@iba-cast-gallery/types';

/**
 * 有効なキャスト情報を全件取得する
 */
export async function getActiveCasts(): Promise<CastDto[]> {
    await initializeDatabase();

    const castRepository:Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.findBy({
        isActive: true,
    });

    console.log("casts:", casts);

    return casts.map((cast) => ({
        id:cast.id,
        name:cast.name,
        enName:cast.enName,
        type:cast.type,
        introduceTweetId:cast.introduceTweetId,
        taggedPosts:[],
    })); 
}
