import { Grid } from "@mui/material";
import type { PostWithCastsDto } from "@iba-cast-gallery/types";
import BlogPostCard from "components/BlogPostCard";

export default function BlogPosts({
  posts,
}: {
  posts: PostWithCastsDto[];
}) {
  return (
    <Grid container spacing={2} className="w-full">
      {posts.map((post) => (
        <Grid key={post.id} size={{ xs: 12, md: 6, lg: 4 }}>
          <BlogPostCard post={post} />
        </Grid>
      ))}
    </Grid>
  );
}
