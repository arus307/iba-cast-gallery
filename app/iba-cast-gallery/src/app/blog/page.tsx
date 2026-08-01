import { Box, Typography } from "@mui/material";
import { getActiveCasts } from "services/castService";
import { getExistsBlogPosts } from "services/postService";
import type { CastDto, PostWithCastsDto } from "@iba-cast-gallery/types";
import BlogPostFilter from "components/BlogPostFilter";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [casts, posts] = await Promise.all([
    getActiveCasts(),
    getExistsBlogPosts(),
  ]);
  const joinedPosts: PostWithCastsDto[] = posts.map((post) => ({
    id: post.id,
    postedAt: post.postedAt,
    contentType: post.contentType,
    taggedCasts: post.taggedCasts
      .map((tag) => ({
        order: tag.order,
        cast: casts.find((cast) => cast.id === tag.castId),
      }))
      .filter((tag): tag is { order: number; cast: CastDto } => tag.cast !== undefined),
  }));

  return (
    <Box className="w-full">
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        IBAだいありぃ BLOG
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        IBAだいありぃで紹介されたキャストのBLOGポストです。
      </Typography>
      {joinedPosts.length > 0 ? (
        <BlogPostFilter casts={casts} posts={joinedPosts} />
      ) : (
        <Typography color="text.secondary">BLOGポストはまだありません。</Typography>
      )}
    </Box>
  );
}
