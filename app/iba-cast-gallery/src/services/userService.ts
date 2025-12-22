import "server-only";
import { initializeDatabase, appDataSource } from "data-source";
import { Favorite, Repository } from "@iba-cast-gallery/dao";
import { User, UserAccount } from "@iba-cast-gallery/dao";
import { PostWithCastsDto } from '@iba-cast-gallery/types';
import { Post } from "@iba-cast-gallery/dao";

/**
 * DiscordのIDからユーザー情報を取得
 * @param discordId DiscordのID
 * @returns ユーザー情報 (存在しない場合はnull)
 */
export async function getUserByDiscordId(discordId: string): Promise<User | null> {
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

    return user;
}

/**
 * DiscordのIDから新しいユーザーを作成(ログイン用アカウント情報もあわせて作成する)
 * 
 * @param discordId DiscordのID
 * @returns 作成されたユーザー情報
 */
export async function createNewUserByDiscordId(discordId: string): Promise<User> {
    await initializeDatabase();

    const userRepository: Repository<User> = appDataSource.getRepository(User);
    const userAccountRepository: Repository<UserAccount> = appDataSource.getRepository(UserAccount);

    // 新しいユーザーを作成
    const newUser = userRepository.create();
    const savedUser = await userRepository.save(newUser);

    // ユーザーアカウントを作成
    const userAccount = userAccountRepository.create({
        userId: savedUser.id,
        provider: 'discord',
        providerAccountId: discordId,
        user: savedUser,
    });
    
    await userAccountRepository.save(userAccount);

    if (process.env.NODE_ENV === 'development') {
        console.log("新しいユーザーを作成しました:", newUser);
        console.log("新しいアカウントを作成しました:", userAccount);
    }

    return savedUser;
}

/**
 * ユーザーのお気に入りポストを取得
 * @param user ユーザー情報
 * @returns お気に入りポストの配列
 */
export async function getFavoritePosts(user:User): Promise<PostWithCastsDto[]> {
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
        return [];
    }

    // 配列に含まれるidの投稿を取得
    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const posts = await postRepository.createQueryBuilder("post")
        .leftJoinAndSelect("post.castTags", "castTag")
        .leftJoinAndSelect("castTag.cast", "cast")
        .where("post.id IN (:...postIds)", { postIds })
        .getMany();

    // お気に入り登録順になるように再マップ
    const postsById = new Map(posts.map(p => [p.id, p]));
    const orderedPosts = postIds.map(id => postsById.get(id)).filter((p): p is Post => p !== undefined);

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
                oshiMark: castTag.cast.oshiMark,
                taggedPosts: []
            },
        })) || []
    }));
}

/**
 * お気に入りポストのIDの配列を取得
 * @param user ユーザー情報
 */
export async function getFavoritePostIds(user:User): Promise<string[]>{
    await initializeDatabase();

    const favoriteRepository: Repository<Favorite> = appDataSource.getRepository(Favorite);
    const favorites = await favoriteRepository.find({
        where: { userId: user.id },
        select: ["postId"],
    });

    return favorites.map(fav => fav.postId);
}
