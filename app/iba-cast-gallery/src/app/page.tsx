import TweetFilter from "./client-components/TweetFilter";
import { getActiveCasts } from "services/castService";
import { getExistsPosts } from "services/postService";
import { CastDto } from "@iba-cast-gallery/types";
import { getFavoritePostIdsAction } from "./actions";

export const dynamic = 'force-dynamic';

export default async function Home () {

  const casts = await getActiveCasts();
  const posts = await getExistsPosts();
  const favoritePostIds = await getFavoritePostIdsAction();

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
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      <TweetFilter casts={casts} posts={joinedPost} favoritePostIds={favoritePostIds instanceof Error ? [] : favoritePostIds}/>
    </main>
  );
}
