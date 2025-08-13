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
          <Grid2 container justifyContent="center" className="w-full">
            <CircularProgress />
          </Grid2>
        ) : (
          posts.map((post, index) => (
            <Grid2 key={post.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }} data-testid={`tweet-list-item-${index+1}`}>
              <div className="border p-4 rounded">
                {
                  post.isDeleted ? (
                    <Typography variant="body2" color="error">削除済み</Typography>
                  ) : (
                    <Tweet id={post.id} taggedCasts={post.castTags.sort((a, b) => a.order - b.order).map((castTag) => castTag.cast)} />
                  )
                }
                <Typography variant="body1">id: {post.id}</Typography>
                <Typography variant="body1">postedAt: {dayjs(post.postedAt).format('YYYY-MM-DD hh:mm:ss')}</Typography>
                <Typography variant="body1">isDeleted: {post.isDeleted ? "true" : "false"}</Typography>
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