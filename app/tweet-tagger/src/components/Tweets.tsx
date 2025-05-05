import TweetCard from "components/TweetCard";
import Grid2 from "@mui/material/Grid2";
import { Post } from '@iba-cast-gallery/dao';

export default function Tweets({ posts }: { posts: Post[] }) {

  return (
    <Grid2 container spacing={2} className="w-full">
      {posts.map((tweet) => (
        <Grid2 key={tweet.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
          <TweetCard tweet={tweet} />
        </Grid2>
      ))}
    </Grid2>
  );
};
