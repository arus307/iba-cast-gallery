import { NextResponse } from "next/server";
import { getPostById } from "@/services/postService";

/**
 * idを元にポストを取得するAPI
 * @param request 
 * @param postId ポスト(ツイート)のID
 * @returns ポスト情報、存在しない場合は404を返却する
 */
export async function GET(
    request: Request,
    { params }: { params: { postId: string } }
) {
    console.log("GET postId:", params.postId);

    try {
        const post = await getPostById(params.postId);
        if (post === null) {
            return NextResponse.json({ error: "ポストが存在しません" }, { status: 404 });
        }

        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}