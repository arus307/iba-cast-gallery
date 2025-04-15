import 'reflect-metadata';
import { initializeDatabase,appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastDto } from '@iba-cast-gallery/types';

/**
 * アクティブなキャスト情報を全件返却するAPI
 */
export async function GET() {
    await initializeDatabase();

    const castRepository:Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.findBy({
        isActive: true,
    });

    const castDtos:CastDto[] = casts.map((cast) => ({
        id:cast.id,
        name:cast.name,
        enName:cast.enName,
        type:cast.type,
        introduceTweetId:cast.introduceTweetId,
        taggedPosts:[],
    })); 

    return Response.json(castDtos);
}