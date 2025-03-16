import React from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import {Tweet} from 'components/tweet/swr';
// import { Tweet } from 'react-tweet';
import { db } from 'db';
import CastChip from 'components/CastChip';

interface TweetCardProps {
    tweet: CastMediaTweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
    const casts = db.casts.filter((cast) => tweet.taggedCastIds.includes(cast.id));

    return (
        <Card variant='outlined'>
            <CardContent  sx={{p:0 ,'&:last-child':{pb:0}}}>
                <Tweet id={tweet.id} taggedCasts={casts}/>
            </CardContent>
        </Card>
    );
};

export default TweetCard;