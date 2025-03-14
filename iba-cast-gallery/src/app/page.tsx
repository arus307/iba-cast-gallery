import { db } from "app/db";
import TweetCard from "app/components/TweetCard";
import { Grid2 } from "@mui/material";

export default function Home() {
  return (
  <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Grid2 container spacing={2}>
          {db.tweets.map((tweet) => (
            <Grid2 key={tweet.id}>
              <TweetCard tweet={tweet} />
            </Grid2>
          ))
        }
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
