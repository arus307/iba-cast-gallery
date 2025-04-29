import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastDto } from '@iba-cast-gallery/types';

/**
 * キャスト情報を全件取得する
 */
export async function getAllCasts(): Promise<CastDto[]> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.find();

    return casts.map((cast) => ({
        id: cast.id,
        name: cast.name,
        enName: cast.enName,
        type: cast.type,
        introduceTweetId: cast.introduceTweetId,
        taggedPosts: [],
    }));
}
