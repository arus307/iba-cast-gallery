"use server";
import { Typography, Stack, Link } from "@mui/material";
import getDb from "getDb";
import TweetFilter from "./client-components/TweetFilter";

export default async function Home () {

  const db = await getDb();

  return (
  <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <TweetFilter db={db}/>
    </main>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <Stack direction="column" spacing={0.5} alignItems="center">
        <Typography variant="h6">
          このサイトは、IBA公式とは一切関係のないファンサイトです。
        </Typography>
        <Typography variant="subtitle2">
          タグ付けの誤りや反映されていないツイート、その他の問題がある場合はarus(X:<Link href="https://x.com/arus307" target='_blank' rel='noopener noreferrer'>@arus307</Link>)までご連絡ください。
        </Typography>
      </Stack>
    </footer>
  </div>
  );
}
