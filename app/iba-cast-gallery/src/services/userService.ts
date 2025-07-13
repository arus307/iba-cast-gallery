import "server-only";
import { initializeDatabase, appDataSource } from "data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { User, UserAccount } from "@iba-cast-gallery/dao";

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

    console.log("新しいユーザーを作成しました:", newUser);
    console.log("新しいアカウントを作成しました:", userAccount);

    return savedUser;
}