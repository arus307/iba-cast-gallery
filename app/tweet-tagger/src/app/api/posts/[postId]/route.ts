import { NextResponse } from "next/server";
import { getPostById, deletePostById } from "services/postService";
import { auth } from "auth";

/**
 * idを元にポストを取得するAPI
 * @param request 
 * @param postId ポスト(ツイート)のID
 * @returns ポスト情報、存在しない場合は404を返却する
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        console.log(session);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const post = await getPostById((await params).postId);
        if (post === null) {
            return NextResponse.json({ error: "ポストが存在しません" }, { status: 404 });
        }

        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

/**
 * ポストを削除するAPI
 * @param request 
 * @param postId ポスト(ツイート)のID
 * @returns  成功時は200, 失敗時は500を返却する, 指定のポストが存在しない場合は404を返却する
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const postId = (await params).postId;
        const post = await getPostById(postId);
        if (post === null) {
            return NextResponse.json({ error: "ポストが存在しません" }, { status: 404 });
        }

        await deletePostById(postId);
        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
