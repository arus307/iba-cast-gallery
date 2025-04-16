"use server";
import { Typography, Stack, Link } from "@mui/material";
import TweetFilter from "./client-components/TweetFilter";
import { getActiveCasts } from "services/castService";
import { getExistsPosts } from "services/postService";
import { CastDto } from "@iba-cast-gallery/types";

export default async function Home () {

  const casts = await getActiveCasts();
  const posts = await getExistsPosts();

  const joinedPost:JoinedPost[] = posts.map((post) => {
    const taggedCasts = post.taggedCasts.map((castId) => {
      return casts.find((cast) => cast.id === castId);
    }).filter((cast): cast is CastDto => cast !== undefined);
    return {
      id: post.id,
      postedAt: post.postedAt,
      taggedCasts: taggedCasts,
    };
  });

  return (
  <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <TweetFilter casts={casts} posts={joinedPost} />
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
