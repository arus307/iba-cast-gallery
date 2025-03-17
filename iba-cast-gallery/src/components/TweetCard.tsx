import React from 'react';
import {Tweet} from 'components/tweet/swr';

interface TweetCardProps {
    tweet: CastMediaTweet;
    taggedCasts: Cast[];
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, taggedCasts }) => {
    return (
        <Tweet id={tweet.id} taggedCasts={taggedCasts}/>
    );
};

export default TweetCard;