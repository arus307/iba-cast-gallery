import { Post } from "@iba-cast-gallery/dao";
import { NextResponse } from "next/server";
import { registerPost } from "@/services/postService";
import { getAllCasts } from "@/services/castService";
import { auth } from "@/auth";


/**
 * ポスト情報を登録する
 */
export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const post: Post = body.post;

        // キャストの存在チェック
        const casts = await getAllCasts();
        const containNotExistCast = post.taggedCasts.some((cast) => {
            return casts.findIndex((c) => c.id === cast.id) === -1;
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