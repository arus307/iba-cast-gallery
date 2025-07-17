"use client";

import { useSession } from "next-auth/react";
import { CircularProgress } from "@mui/material";
import Tweets from "components/Tweets";
import { getFavoritePostIdsAction, getFavoritesAction } from "app/actions";
import useSWR from "swr";

export default function Favorites() {

  const { data: favoritePosts, error, isLoading } = useSWR('favorite-posts', getFavoritesAction);

  if (isLoading) {
    return (
      <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
    );
  }

  console.log("favoritePosts", favoritePosts);

  if (!favoritePosts || favoritePosts instanceof Error || error) {
    return (
      <div>
        ログインが必要なページです。
      </div>
    );
  }

  const favoritePostIds = favoritePosts.map(post => post.id);

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
      お気に入りページ
      <Tweets joinedPosts={favoritePosts} favoritePostIds={favoritePostIds} />
    </main>
  );
};
