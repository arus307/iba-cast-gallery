import { auth } from "auth";
import { getUserByDiscordId, getFavoritePosts } from "services/userService";
import { createWithLogging, Logger } from "@iba-cast-gallery/logger";
import { NextRequest, NextResponse } from "next/server";

const withLogging = createWithLogging({ auth });

export const GET = withLogging(async (_req: NextRequest, _ctx: { params: {} }, logger: Logger) => {
    const session = await auth();

    if(!session || !session.user || !session.user.id){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByDiscordId(logger, session.user.id)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // お気に入りのポストを取得
    const favoritePosts = await getFavoritePosts(logger, user);
    return NextResponse.json(favoritePosts);
});
