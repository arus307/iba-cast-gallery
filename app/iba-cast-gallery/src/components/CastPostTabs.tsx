"use client";

import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import type { PostWithCastsDto } from "@iba-cast-gallery/types";
import BlogPosts from "components/BlogPosts";
import Tweets from "components/Tweets";

export default function CastPostTabs({
  galleryPosts,
  blogPosts,
}: {
  galleryPosts: PostWithCastsDto[];
  blogPosts: PostWithCastsDto[];
}) {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_event, value: number) => setTab(value)}
        aria-label="キャストのポスト種別"
        sx={{ mb: 2 }}
      >
        <Tab label={`画像ポスト (${galleryPosts.length})`} id="cast-post-tab-0" />
        <Tab label={`BLOG (${blogPosts.length})`} id="cast-post-tab-1" />
      </Tabs>
      <Box role="tabpanel" hidden={tab !== 0} aria-labelledby="cast-post-tab-0">
        {tab === 0 && (
          galleryPosts.length > 0 ? (
            <Tweets joinedPosts={galleryPosts} />
          ) : (
            <Typography color="text.secondary">画像ポストはまだありません。</Typography>
          )
        )}
      </Box>
      <Box role="tabpanel" hidden={tab !== 1} aria-labelledby="cast-post-tab-1">
        {tab === 1 && (
          blogPosts.length > 0 ? (
            <BlogPosts posts={blogPosts} />
          ) : (
            <Typography color="text.secondary">BLOGポストはまだありません。</Typography>
          )
        )}
      </Box>
    </Box>
  );
}
