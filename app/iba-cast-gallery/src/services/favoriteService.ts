import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "data-source";
import { Repository } from '@iba-cast-gallery/dao';
import { Favorite } from '@iba-cast-gallery/dao';
import { Logger } from '@iba-cast-gallery/logger';

/**
 * お気に入りに投稿を追加する
 * 
 * @param userId お気に入りを追加するユーザーのID
 * @param postId お気に入りに追加するポストのID
 * @returns void
 */
export async function addFavoritePost(logger: Logger, userId:number, postId : string): Promise<void>{
    const childLogger = logger.child({service: 'favoriteService', function: 'addFavoritePost', userId, postId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const favoriteRepository: Repository<Favorite> = appDataSource.getRepository(Favorite);

    // お気に入り登録が既に存在するか確認
    const existingFavorite = await favoriteRepository.findOne({
        where: { userId: userId, postId: postId },
    });

    if (existingFavorite) {
        childLogger.warn("この投稿はすでにお気に入りに登録されています。");
        return;
    }

    // 新しいお気に入りを作成
    const newFavorite = favoriteRepository.create({ userId, postId });
    await favoriteRepository.insert(newFavorite);
    
    childLogger.info("お気に入り投稿を追加しました。");
}

/**
 * お気に入りから投稿を削除する
 * 
 * @param userId お気に入りを削除するユーザーのID
 * @param postId お気に入りから削除するポストのID
 * @returns void
 */
export async function deleteFavoritePost(logger: Logger, userId:number, postId: string): Promise<void> {
    const childLogger = logger.child({service: 'favoriteService', function: 'deleteFavoritePost', userId, postId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const favoriteRepository: Repository<Favorite> = appDataSource.getRepository(Favorite);

    // お気に入り登録を削除
    const result = await favoriteRepository.delete({ postId, userId });

    if (result.affected === 0) {
        childLogger.warn("指定された投稿はお気に入りに登録されていません。");
    } else {
        childLogger.info("お気に入り投稿を削除しました。");
    }
}
