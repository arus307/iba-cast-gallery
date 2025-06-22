"use server";

import { auth } from "auth";
import { Fab, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";
import TweetList from "app/client-component/TweetList";
import AddIcon from "@mui/icons-material/Add";

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
      <Fab color="primary" aria-label="新規ポスト登録" href="/" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </>
  );
}
