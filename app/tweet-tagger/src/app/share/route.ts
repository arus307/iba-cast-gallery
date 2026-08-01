import { NextResponse } from "next/server";
import { extractPostId } from "utils/postId";

const SEE_OTHER = 303;

function redirectToHome(request: Request, error: "invalid" | "failed") {
  const url = new URL("/", request.url);
  url.searchParams.set("shareError", error);
  return NextResponse.redirect(url, SEE_OTHER);
}

function redirectToPreparation(request: Request, postId: string) {
  const url = new URL("/share/prepare", request.url);
  url.searchParams.set("id", postId);
  return NextResponse.redirect(url, SEE_OTHER);
}

/**
 * PWA の共有ターゲットから X の共有内容を受け取る。
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const postId = extractPostId(
    formData.get("url")?.toString(),
    formData.get("text")?.toString(),
    formData.get("title")?.toString(),
  );

  if (postId === null) {
    return redirectToHome(request, "invalid");
  }

  // PWAの起動画面を早く閉じるため、認証・DB保存は受付画面を描画した後に行う。
  return redirectToPreparation(request, postId);
}
