"use server";
import { notFound } from "next/navigation";
import getDb from "getDb";
import {Stack, Grid2 } from "@mui/material";
import Tweets from "components/Tweets";
import { Tweet } from "components/tweet/swr";

export async function generateStaticParams() {
    const db: JoinedDb = await getDb();
    const casts = db.casts;
    return casts.map((cast) => ({
        type: cast.type,
        enName: cast.enName        
    }));
}


const CastPage = async ({ params }: { params: Promise<{type:CastType, enName:string}>}) => {
    const {type, enName} = await params;

    const db: JoinedDb = await getDb();
    const cast = db.casts.find(cast => cast.type === type && cast.enName === enName);
    if(cast === undefined) {
        return notFound();
    }

    const tweets = db.tweets.filter(tweet => tweet.taggedCasts.includes(cast));

    return (
        <Stack direction="column" className="w-full" spacing={4}>
            <Grid2 size={12} container justifyContent="center" alignItems="center">
                <Tweet id={cast.introduceTweetId} taggedCasts={[cast]}/>
            </Grid2>
            <Grid2 size={12}>
                <Tweets joinedTweets={tweets}/>                
            </Grid2>
        </Stack>
    );
};

export default CastPage;