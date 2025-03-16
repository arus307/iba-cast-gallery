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
        <Tweet id={tweet.id} taggedCasts={casts}/>
    );
};

export default TweetCard;