import "server-only";
import { initializeDatabase, appDataSource } from "data-source";
import { Favorite, Repository } from "@iba-cast-gallery/dao";
import { User, UserAccount } from "@iba-cast-gallery/dao";
import { PostWithCastsDto } from '@iba-cast-gallery/types';
import { Post } from "@iba-cast-gallery/dao";
import { Logger } from "@iba-cast-gallery/logger";

/**
 * DiscordのIDからユーザー情報を取得
 * @param discordId DiscordのID
 * @returns ユーザー情報 (存在しない場合はnull)
 */
export async function getUserByDiscordId(logger: Logger, discordId: string): Promise<User | null> {
    const childLogger = logger.child({service: 'userService', function: 'getUserByDiscordId', discordId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const userRepository: Repository<User> = appDataSource.getRepository(User);
    const user = await userRepository.findOne({
        where: {
            accounts: {
                provider: 'discord',
                providerAccountId: discordId,
            },
        },
        relations: ['accounts'],
    });

    childLogger.info({ found: !!user }, 'サービス呼び出し終了');
    return user;
}

/**
 * DiscordのIDから新しいユーザーを作成(ログイン用アカウント情報もあわせて作成する)
 * 
 * @param discordId DiscordのID
 * @returns 作成されたユーザー情報
 */
export async function createNewUserByDiscordId(logger: Logger, discordId: string): Promise<User> {
    const childLogger = logger.child({service: 'userService', function: 'createNewUserByDiscordId', discordId});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const userRepository: Repository<User> = appDataSource.getRepository(User);
    const userAccountRepository: Repository<UserAccount> = appDataSource.getRepository(UserAccount);

    // 新しいユーザーを作成
    const newUser = userRepository.create();
    const savedUser = await userRepository.save(newUser);
    childLogger.info({ userId: savedUser.id }, '新規ユーザー作成');

    // ユーザーアカウントを作成
    const userAccount = userAccountRepository.create({
        userId: savedUser.id,
        provider: 'discord',
        providerAccountId: discordId,
        user: savedUser,
    });
    
    await userAccountRepository.save(userAccount);
    childLogger.info({ userId: savedUser.id, provider: 'discord' }, '新規ユーザーアカウント作成');

    childLogger.info('サービス呼び出し終了');
    return savedUser;
}

/**
 * ユーザーのお気に入りポストを取得
 * @param user ユーザー情報
 * @returns お気に入りポストの配列
 */
export async function getFavoritePosts(logger: Logger, user:User): Promise<PostWithCastsDto[]> {
    const childLogger = logger.child({service: 'userService', function: 'getFavoritePosts', userId: user.id});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const favoriteRepository = appDataSource.getRepository(Favorite);
    const favorites = await favoriteRepository.find({
        where: { userId: user.id },
        order: { createdAt: "DESC" },
        select: ["postId"],
    });


    // お気に入り登録順のid配列
    const postIds = favorites.map(fav => fav.postId);
    if (postIds.length === 0) {
        childLogger.info('お気に入り登録された投稿がありません。');
        return [];
    }
    childLogger.info({ count: postIds.length }, 'お気に入り投稿IDを取得しました。');

    // 配列に含まれるidの投稿を取得
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.createQueryBuilder("post")
        .leftJoinAndSelect("post.castTags", "castTag")
        .leftJoinAndSelect("castTag.cast", "cast")
        .where("post.id IN (:...postIds)", { postIds })
        .getMany();
    childLogger.info({ count: posts.length }, 'お気に入り投稿の詳細情報を取得しました。');

    // お気に入り登録順になるように再マップ
    const postsById = new Map(posts.map(p => [p.id, p]));
    const orderedPosts = postIds.map(id => postsById.get(id)).filter((p): p is Post => p !== undefined);

    childLogger.info('サービス呼び出し終了');
    return orderedPosts.map((post) => ({
        id: post.id,
        postedAt: post.postedAt,
        taggedCasts: post.castTags?.map((castTag) => ({
            order: castTag.order,
            cast: {
                id: castTag.cast.id,
                name: castTag.cast.name,
                enName: castTag.cast.enName,
                introduceTweetId: castTag.cast.introduceTweetId,
                type: castTag.cast.type,
                taggedPosts: []
            },
        })) || []
    }));
}

/**
 * お気に入りポストのIDの配列を取得
 * @param user ユーザー情報
 */
export async function getFavoritePostIds(logger: Logger, user:User): Promise<string[]>{
    const childLogger = logger.child({service: 'userService', function: 'getFavoritePostIds', userId: user.id});
    childLogger.info('サービス呼び出し開始');
    await initializeDatabase();

    const favoriteRepository: Repository<Favorite> = appDataSource.getRepository(Favorite);
    const favorites = await favoriteRepository.find({
        where: { userId: user.id },
        select: ["postId"],
    });

    childLogger.info({ count: favorites.length }, 'サービス呼び出し終了');
    return favorites.map(fav => fav.postId);
}
