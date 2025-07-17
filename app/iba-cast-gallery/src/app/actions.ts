
"use server";

import { auth } from "auth";
import { getActiveCasts } from "services/castService";
import { getUserByDiscordId, getFavoritePosts } from "services/userService";
import { addFavoritePost, deleteFavoritePost } from "services/favoriteService";

/**
 * アクティブなキャストを取得するアクション
 */
export async function getActiveCastsAction() {
    return await getActiveCasts();
}

/**
 * お気に入りのポストを取得するアクション
 */
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

/**
 * お気に入りのポストを追加するアクション
 * 
 * @param postId お気に入りに追加するポストのID
 */
export async function addFavoritePostAction(postId: string) {
    const session = await auth();
    if(!session || session.user?.discordId === undefined){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return Error("Unauthorized");
    }

    const user = await getUserByDiscordId(session.user.discordId);
    if(!user || !user.id){
        return Error("User not found");
    }

    // お気に入りに投稿を追加
    await addFavoritePost(user?.id ,postId);
}

/**
 * お気に入りからポストを削除するアクション
 * @param postId お気に入りから削除するポストのID
 */
export async function deleteFavoritePostAction(postId:string){
    const session = await auth();
    if(!session || session.user?.discordId === undefined){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return Error("Unauthorized");
    }

    const user = await getUserByDiscordId(session.user.discordId);
    if(!user || !user.id){
        return Error("User not found");
    }

    // お気に入りから投稿を削除
    await deleteFavoritePost(user.id ,postId);
}