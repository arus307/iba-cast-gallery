import React from 'react';
import {Tweet} from 'components/tweet/swr';
import { db } from 'db';

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