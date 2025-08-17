import { Post } from "@iba-cast-gallery/dao";
import { NextRequest, NextResponse } from "next/server";
import { registerPost, getAllPosts } from "services/postService";
import { getAllCasts } from "services/castService";
import { auth } from "auth";
import { createWithLogging, Logger } from "@iba-cast-gallery/logger";

const withLogging = createWithLogging({ auth });

/**
 * ポスト情報を登録する
 */
export const POST = withLogging(async (request, context, logger) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const post: Post = body.post;

    logger.info({ body }, `ポスト登録リクエスト受信`);

    // キャストの存在チェック
    const casts = await getAllCasts(logger);
    const containNotExistCast = post.castTags.some((castTag) => {
        return casts.findIndex((c) => c.id === castTag.castid) === -1;
    });
    if (containNotExistCast) {
        return NextResponse.json({ error: "キャストが存在しません" }, { status: 400 });
    }

    await registerPost(logger, post);

    return NextResponse.json(post, { status: 201 });
});

/**
 * ポスト情報を全件取得する
 */
export const GET = withLogging(async (_, __, logger) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await getAllPosts(logger);
    return NextResponse.json(posts, { status: 200 });
});
