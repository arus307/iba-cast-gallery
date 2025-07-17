import React from 'react';
import {Tweet} from 'components/tweet/swr';

const TweetCard = ( {tweet, favoritePostIds}:{tweet:JoinedPost, favoritePostIds: string[]}) => {
    return (
        <Tweet id={tweet.id} taggedCasts={tweet.taggedCasts} favoritePostIds={favoritePostIds}/>
    );
};

export default TweetCard;