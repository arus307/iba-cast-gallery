import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";

/**
 * キャスト情報を全件取得する
 */
export async function getAllCasts(): Promise<Cast[]> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.find();

    return casts;
}
