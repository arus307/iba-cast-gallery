import React from 'react';
import {Tweet} from 'components/tweet/swr';
import {PostWithCastsDto} from '@iba-cast-gallery/types';

const TweetCard = ( {tweet}:{tweet:PostWithCastsDto}) => {
    return (
        <Tweet id={tweet.id} taggedCasts={tweet.taggedCasts}/>
    );
};

export default TweetCard;