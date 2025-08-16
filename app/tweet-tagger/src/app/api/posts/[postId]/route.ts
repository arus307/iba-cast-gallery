import { NextRequest, NextResponse } from "next/server";
import { getPostById, deletePostById } from "services/postService";
import { auth } from "auth";
import { Logger, withLogging } from "@iba-cast-gallery/logger";

type Context = {
    params: { postId: string }
}

/**
 * idを元にポストを取得するAPI
 * @param request 
 * @param postId ポスト(ツイート)のID
 * @returns ポスト情報、存在しない場合は404を返却する
 */
export const GET = withLogging(async (
    _: NextRequest,
    { params }: Context,
    logger: Logger
) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await getPostById(logger, params.postId);
    if (post === null) {
        return NextResponse.json({ error: "ポストが存在しません" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
});

/**
 * ポストを削除するAPI
 * @param request 
 * @param postId ポスト(ツイート)のID
 * @returns  成功時は200, 失敗時は500を返却する, 指定のポストが存在しない場合は404を返却する
 */
export const DELETE = withLogging(async (
    _: NextRequest,
    { params }: Context,
    logger: Logger
) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.postId;
    const post = await getPostById(logger, postId);
    if (post === null) {
        return NextResponse.json({ error: "ポストが存在しません" }, { status: 404 });
    }

    await deletePostById(logger, postId);
    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
});
