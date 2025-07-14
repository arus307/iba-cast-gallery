
"use server";

import { auth } from "auth";
import { getActiveCasts } from "services/castService";
import { getUserByDiscordId, getFavoritePosts } from "services/userService";

export async function getActiveCastsAction() {
    return await getActiveCasts();
}

export async function getFavoritesAction() {
    const session = await auth();

    if(!session || session.user?.discordId === undefined){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return Error("Unauthorized");
    }

    const user = await getUserByDiscordId(session.user.discordId)       
    if(!user){
        return [];
    }

    // お気に入りのポストを取得
    const favoritePosts = await getFavoritePosts(user);
    return favoritePosts;
}