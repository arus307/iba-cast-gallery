import React from 'react';
import {Tweet} from 'components/tweet/swr';

const TweetCard = ( {tweet}:{tweet:JoinedCastMediaTweet}) => {
    return (
        <Tweet id={tweet.id} taggedCasts={tweet.taggedCasts}/>
    );
};

export default TweetCard;