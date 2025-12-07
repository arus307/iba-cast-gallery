import TweetCard from "components/TweetCard";
import { Grid } from "@mui/material";
import { PostWithCastsDto } from "@iba-cast-gallery/types";

export default function Tweets({
  joinedPosts,
}: {
  joinedPosts: PostWithCastsDto[];
}) {
  return (
    <Grid container spacing={2} className="w-full">
      {joinedPosts.map((tweet) => (
        <Grid key={tweet.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
          <TweetCard tweet={tweet} />
        </Grid>
      ))}
    </Grid>
  );
}
