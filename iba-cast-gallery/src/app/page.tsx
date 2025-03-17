'use client';

import { useState } from "react";
import TweetCard from "components/TweetCard";
import Grid2 from "@mui/material/Grid2";
import CastSelect from "components/CastSelect";
import { Typography, Stack, Link } from "@mui/material";
import { useData } from "context/DataContext";

export default function Home() {

  const db = useData();

  const [selectedCast, setSelectedCast] = useState<Cast | null>(null);
  const displayTweets = db.tweets.filter((tweet) => {
    if (selectedCast) {
      return tweet.taggedCastIds.includes(selectedCast.id);
    } else {
      return true;
    }
  })
  .sort((a, b) => b.postedAt.isAfter(a.postedAt) ? 1 : -1);

  return (
  <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <Grid2 container spacing={2} className="w-full">
        <Grid2 size={12}>
          <CastSelect casts={db.casts} selectedCast={selectedCast} setSelectedCast={setSelectedCast} />
        </Grid2>
        {displayTweets.map((tweet) => (
          <Grid2 key={tweet.id} size={{xs:12, md:6, lg:4, xl:3}}>
            <TweetCard tweet={tweet} taggedCasts={db.casts.filter((cast)=>tweet.taggedCastIds.includes(cast.id))}/>
          </Grid2>
        ))}
      </Grid2>
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
