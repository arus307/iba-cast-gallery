import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { Logger } from "@iba-cast-gallery/logger";

/**
 * キャスト情報を全件取得する
 */
export async function getAllCasts(logger: Logger): Promise<Cast[]> {
    const childLogger = logger.child({service: 'castService', function: 'getAllCasts'});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.find({
        order: {
            id: "ASC",
        },
    });

    childLogger.info({ count: casts.length }, 'サービス呼び出し終了');
    return casts;
}
