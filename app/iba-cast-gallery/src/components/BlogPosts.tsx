"use client";

import type { PostWithCastsDto } from "@iba-cast-gallery/types";
import BlogPostCard from "components/BlogPostCard";
import IncrementalPostGrid from "components/IncrementalPostGrid";

export default function BlogPosts({
  posts,
}: {
  posts: PostWithCastsDto[];
}) {
  return (
    <IncrementalPostGrid
      items={posts}
      getItemKey={(post) => post.id}
      renderItem={(post) => <BlogPostCard post={post} />}
      itemSize={{ xs: 12, md: 6, lg: 4 }}
    />
  );
}
