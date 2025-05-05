"use server";

import { auth } from "auth";
import { Typography } from "@mui/material";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";
import TweetList from "app/client-component/TweetList";

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
      <Typography>登録済みポスト一覧</Typography>
      <TweetList />
    </>
  );
}
