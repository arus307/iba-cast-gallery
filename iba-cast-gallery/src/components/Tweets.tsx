import TweetCard from "components/TweetCard";
import Grid2 from "@mui/material/Grid2";

export default function Tweets ({joinedTweets}:{joinedTweets:JoinedCastMediaTweet[]}) {

  return (
    <Grid2 container spacing={2} className="w-full">
        {joinedTweets.map((tweet) => (
            <Grid2 key={tweet.id} size={{xs:12, md:6, lg:4, xl:3}}>
                <TweetCard tweet={tweet} />
            </Grid2>
        ))}
    </Grid2>
  );
};
