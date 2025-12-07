import TweetCard from "components/TweetCard";
import { Grid } from "@mui/material";
import { Post } from "@iba-cast-gallery/dao";

export default function Tweets({ posts }: { posts: Post[] }) {
  return (
    <Grid container spacing={2} className="w-full">
      {posts.map((tweet) => (
        <Grid key={tweet.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
          <TweetCard tweet={tweet} />
        </Grid>
      ))}
    </Grid>
  );
}
