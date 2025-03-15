"use client"

import { useState } from "react";
import { db } from "app/db";
import TweetCard from "components/TweetCard";
import Grid2 from "@mui/material/Grid2";
import CastSelect from "components/CastSelect";

export default function Home() {
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
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <CastSelect casts={db.casts} selectedCast={selectedCast} setSelectedCast={setSelectedCast} />
        </Grid2>
        {displayTweets.map((tweet) => (
          <Grid2 key={tweet.id}>
            <TweetCard tweet={tweet} />
          </Grid2>
        ))}
      </Grid2>
    </main>
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <h6>
          このサイトは、IBA公式とは一切関係のないファンサイトです。
        </h6>
    </footer>
  </div>
  );
}
