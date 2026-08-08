import { NextResponse } from "next/server";
import {
    deletePostById,
    getPostById,
    updatePostShiftRegistrationExclusion,
} from "services/postService";
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

/**
 * シフト登録候補からの除外状態を更新する。
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ postId: string }> },
) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: unknown = await request.json();
        if (
            typeof body !== "object" ||
            body === null ||
            !("excludeFromShiftRegistration" in body) ||
            typeof body.excludeFromShiftRegistration !== "boolean"
        ) {
            return NextResponse.json(
                { error: "excludeFromShiftRegistration must be a boolean" },
                { status: 400 },
            );
        }

        const postId = (await params).postId;
        const updated = await updatePostShiftRegistrationExclusion(
            postId,
            body.excludeFromShiftRegistration,
        );
        if (!updated) {
            return NextResponse.json(
                { error: "ポストが存在しません" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { postId, excludeFromShiftRegistration: body.excludeFromShiftRegistration },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error updating post shift registration exclusion:", error);
        return NextResponse.json(
            { error: "Failed to update post shift registration exclusion" },
            { status: 500 },
        );
    }
}
