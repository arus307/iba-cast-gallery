import React from 'react';
import { Tweet } from 'components/tweet/swr';
import { Post } from '@iba-cast-gallery/dao';

const TweetCard = ({ tweet }: { tweet: Post }) => {

    return (
        <Tweet id={tweet.id} taggedCasts={tweet.taggedCasts} />
    );
};

export default TweetCard;