import TweetFilter from "./client-components/TweetFilter";
import { getActiveCasts } from "services/castService";
import { getExistsPosts } from "services/postService";
import { CastDto, PostWithCastsDto } from "@iba-cast-gallery/types";
export const dynamic = 'force-dynamic';

export default async function Home () {

  const casts = await getActiveCasts();
  const posts = await getExistsPosts();

  const joinedPost:PostWithCastsDto[] = posts.map((post) => {
    const taggedCasts = post.taggedCasts.map((a) => {
      return {
        order: a.order,
        cast: casts.find((cast) => cast.id === a.castId),
      };
    }).filter((cast): cast is {order:number, cast:CastDto} => cast !== undefined);
    return {
      id: post.id,
      postedAt: post.postedAt,
      taggedCasts: taggedCasts,
    };
  });

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <TweetFilter casts={casts} posts={joinedPost}/>
    </main>
  );
}
