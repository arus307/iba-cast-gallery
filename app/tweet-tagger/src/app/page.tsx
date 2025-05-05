"use server";

import { auth } from "auth";
import { Typography } from "@mui/material";
import TweetEditor from "app/client-component/TweetEditor";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";
import Link from "next/link";

export default async function Home() {

  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return (
      <NotAdmin />
    );
  }

  return (
    <>
      <Link href="/posts">
        <Typography variant="body2" color="primary">登録済みポスト一覧</Typography>
      </Link>
      <Typography>登録画面</Typography>
      <TweetEditor />
    </>
  );
}
