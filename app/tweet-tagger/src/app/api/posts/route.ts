import { Post } from "@iba-cast-gallery/dao";
import { NextResponse } from "next/server";
import { registerPost } from "@/services/postService";
import { getAllCasts } from "@/services/castService";


/**
 * ポスト情報を登録する
 */
export async function POST(request: Request) {
    // TODO 認証チェック

    try {
        const body = await request.json();
        const post: Post = body.post;

        // キャストの存在チェック
        const casts = await getAllCasts();
        const containNotExistCast = post.taggedCasts.find((cast) => {
            return casts.findIndex((c) => c === cast) === -1;
        });
        if (containNotExistCast) {
            return NextResponse.json({ error: "キャストが存在しません" }, { status: 400 });
        }

        registerPost(post);

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error registering post:", error);
        return NextResponse.json({ error: "Failed to register post" }, { status: 500 });
    }
}