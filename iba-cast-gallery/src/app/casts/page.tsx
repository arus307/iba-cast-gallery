import React from 'react';
import getDb from 'getDb'; 
import {Stack, Grid2 } from "@mui/material";
import Tweets from "components/MediaTweetList";
import { Tweet } from "components/tweet/swr";

const CastsPage = async () => {

    const db: JoinedDb = await getDb();

    return (
        <Grid2 container spacing={2} className="w-full">
        {db.casts.map((cast) => (
            <Grid2 key={cast.id} size={{xs:12, md:6, lg:4, xl:3}}>
                <Tweet id={cast.introduceTweetId} taggedCasts={[cast]}/>
            </Grid2>
        ))}
    </Grid2>
    );
};

export default CastsPage;