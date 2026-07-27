"use server";

import { auth } from "auth";
import { Alert, Typography } from "@mui/material";
import TweetEditor from "app/client-component/TweetEditor";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ shareError?: string }>;
}) {

  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return (
      <NotAdmin />
    );
  }

  const { shareError } = await searchParams;

  return (
    <>
      <Link href="/posts">
        <Typography variant="body2" color="primary">登録済みポスト一覧</Typography>
      </Link>
      <Link href="/shifts">
        <Typography variant="body2" color="primary">シフト登録</Typography>
      </Link>
      <Link href="/events">
        <Typography variant="body2" color="primary">イベント登録</Typography>
      </Link>
      <Typography>登録画面</Typography>
      {shareError === "invalid" && (
        <Alert severity="error">
          共有された内容からXのポストURLを読み取れませんでした。
        </Alert>
      )}
      {shareError === "failed" && (
        <Alert severity="error">
          共有されたポストをドラフト保存できませんでした。もう一度お試しください。
        </Alert>
      )}
      <TweetEditor initialId="" />
    </>
  );
}
