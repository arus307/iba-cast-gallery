"use client";

import { Post } from "@iba-cast-gallery/dao";
import { Tweet } from "components/tweet/swr";
import { Button, CircularProgress, Grid2, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TweetList = () => {

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          // エラー処理
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching casts:", error);
      }
    };

    fetchPosts()
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const router = useRouter();
  const handleEdit = (post: Post) => {
    router.push(`/posts/${post.id}/edit`);
  }

  return (
    <Grid2 container spacing={2} className="w-full">
      {
        isLoading ? (
          <CircularProgress />
        ) : (
          posts.map((post) => (
            <Grid2 key={post.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
              <div className="border p-4 rounded">
                {
                  post.isDeleted ? (
                    <Typography variant="body2" color="error">削除済み</Typography>
                  ) : (
                    <Tweet id={post.id} taggedCasts={post.taggedCasts} />
                  )
                }
                <Typography variant="body1">{post.id}</Typography>
                <Typography variant="body1">{dayjs(post.postedAt).format('YYYY-MM-DD hh:mm:ss')}</Typography>
                <Typography variant="body1">{post.taggedCasts.map(cast => cast.name).join(", ")}</Typography>
                <Button onClick={() => { handleEdit(post) }} variant="outlined">
                  編集
                </Button>
              </div>
            </Grid2>
          ))
        )
      }
    </Grid2>
  );
}

export default TweetList;