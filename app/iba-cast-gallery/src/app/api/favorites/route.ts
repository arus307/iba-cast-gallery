import {auth} from "auth";
import { getUserByDiscordId,getFavoritePosts } from "services/userService";
import { Logger, withLogging } from "@iba-cast-gallery/logger";
import { NextRequest, NextResponse } from "next/server";


export const GET = withLogging(async (_: NextRequest, context: { params: {} }, logger: Logger) => {
    const session = await auth();

    if(!session || session.user?.discordId === undefined){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByDiscordId(logger, session.user.discordId)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // お気に入りのポストを取得
    const favoritePosts = await getFavoritePosts(logger, user);
    return NextResponse.json(favoritePosts);
});
