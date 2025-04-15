"use server";
import { Typography, Stack, Link } from "@mui/material";
import TweetFilter from "./client-components/TweetFilter";
import { CastDto, PostDto } from "@iba-cast-gallery/types";

interface data{
  posts:JoinedPost[];
  casts:CastDto[];
}

async function getData(): Promise<data>{
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  console.log(baseUrl);
  const postsApiUrl = `${baseUrl}/api/posts`;
  const castsApiUrl = `${baseUrl}/api/casts`;

  try{
    const postsResponse = await fetch(postsApiUrl);
    const posts:PostDto[] = await postsResponse.json();

    console.log("postsResponse", postsResponse);

    const castsResponse = await fetch(castsApiUrl);
    const casts:CastDto[] = await castsResponse.json();

    console.log("castsResponse", castsResponse);

    return {
      casts: casts,
      posts: posts.map((post) => {
        const taggedCasts = post.taggedCasts.map((castId) => {
          return casts.find((cast) => cast.id === castId);
        }).filter((cast): cast is CastDto => cast !== undefined);
        return {
          id: post.id,
          postedAt: post.postedAt,
          taggedCasts: taggedCasts,
        };
      })  
    };
    
  }catch(error){
    console.error("Error fetching data:", error);
    return {
      casts: [],
      posts: [],
    };
  }
};

export default async function Home () {

  const data = await getData();

  return (
  <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <TweetFilter casts={data.casts} posts={data.posts} />
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
