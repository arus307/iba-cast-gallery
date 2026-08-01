"use client";

import TweetCard from "components/TweetCard";
import IncrementalPostGrid from "components/IncrementalPostGrid";
import type { PostWithCastsDto } from "@iba-cast-gallery/types";

export default function Tweets({
  joinedPosts,
}: {
  joinedPosts: PostWithCastsDto[];
}) {
  return (
    <IncrementalPostGrid
      items={joinedPosts}
      getItemKey={(tweet) => tweet.id}
      renderItem={(tweet) => <TweetCard tweet={tweet} />}
      itemSize={{ xs: 12, md: 6, lg: 4, xl: 3 }}
    />
  );
}
