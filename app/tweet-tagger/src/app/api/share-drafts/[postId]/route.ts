import { auth } from "auth";
import { NextResponse } from "next/server";
import { ensureDraftPost } from "services/postService";
import { extractPostId } from "utils/postId";

/**
 * 共有受付画面から、Xポストを非公開ドラフトとして保存する。
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const rawPostId = (await params).postId;
  const postId = extractPostId(rawPostId);
  if (postId === null || postId !== rawPostId) {
    return NextResponse.json(
      { error: "共有された内容からXのポストURLを読み取れませんでした" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureDraftPost(postId);
    return NextResponse.json({ postId }, { status: 201 });
  } catch (error) {
    console.error("Error saving shared post as draft:", error);
    return NextResponse.json(
      { error: "Failed to save shared post as draft" },
      { status: 500 },
    );
  }
}
