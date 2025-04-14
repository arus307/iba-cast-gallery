import 'reflect-metadata';
import { initializeDatabase,appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";

/**
 * アクティブなキャスト情報を全件返却するAPI
 */
export async function GET() {
    await initializeDatabase();

    const castRepository:Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.findBy({
        isActive: true,
    });

    return Response.json(casts);
}