"use server";

import { auth } from "auth";
import { Typography } from "@mui/material";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";
import Link from "next/link";
import TweetEditor from "app/client-component/TweetEditor";

export default async function Page(
  { params }: { params: Promise<{ postId: string }> }
) {

  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return (
      <NotAdmin />
    );
  }

  const postId = await params.then(p => p.postId);

  return (
    <>
      <Link href="/posts">
        <Typography variant="body2" color="primary">登録済みポスト一覧</Typography>
      </Link>
      <TweetEditor initialId={postId}/>
      <Typography>編集画面</Typography>
      <Typography>id: {postId}</Typography>
    </>
  );
}
