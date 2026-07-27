import { auth } from "auth";
import { NextResponse } from "next/server";
import { ensureDraftPost } from "services/postService";
import { extractPostId } from "utils/postId";

const SEE_OTHER = 303;

function redirectToHome(request: Request, error: "invalid" | "failed") {
  const url = new URL("/", request.url);
  url.searchParams.set("shareError", error);
  return NextResponse.redirect(url, SEE_OTHER);
}

function redirectToSignIn(request: Request, postId: string) {
  const callbackUrl = new URL("/share", request.url);
  callbackUrl.searchParams.set("id", postId);

  const signInUrl = new URL("/api/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", callbackUrl.toString());
  return NextResponse.redirect(signInUrl, SEE_OTHER);
}

async function saveDraftAndRedirect(request: Request, postId: string) {
  const session = await auth();

  if (!session?.user) {
    return redirectToSignIn(request, postId);
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/", request.url), SEE_OTHER);
  }

  try {
    await ensureDraftPost(postId);
    return NextResponse.redirect(
      new URL(`/posts/${postId}/edit?shared=1`, request.url),
      SEE_OTHER,
    );
  } catch (error) {
    console.error("Error saving shared post as draft:", error);
    return redirectToHome(request, "failed");
  }
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

  return saveDraftAndRedirect(request, postId);
}

/**
 * 共有時にログインが切れていた場合、ログイン後にドラフト保存を再開する。
 */
export async function GET(request: Request) {
  const postId = extractPostId(new URL(request.url).searchParams.get("id"));

  if (postId === null) {
    return redirectToHome(request, "invalid");
  }

  return saveDraftAndRedirect(request, postId);
}
