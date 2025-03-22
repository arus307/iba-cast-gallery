"use client";

import Grid2 from "@mui/material/Grid2";
import CastSelect from "components/CastSelect";
import { useState } from "react";
import Tweets from "components/Tweets";

export default function TweetFilter ({db}:{db:JoinedDb}) {

    const [selectedCast, setSelectedCast] = useState<Cast | null>(null);
    const displayTweets = db.tweets.filter((tweet) => {
        if (selectedCast) {
        return tweet.taggedCasts.includes(selectedCast);
        } else {
        return true;
        }
    });

    return (
    <Grid2 container spacing={2} className="w-full">
        <Grid2 size={12}>
            <CastSelect casts={db.casts} selectedCast={selectedCast} setSelectedCast={setSelectedCast} />
        </Grid2>
        <Tweets joinedTweets={displayTweets}/>
    </Grid2>
    );
};
