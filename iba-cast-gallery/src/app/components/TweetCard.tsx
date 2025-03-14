import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {Tweet} from 'react-tweet';


interface TweetCardProps {
    tweet: CastMediaTweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
    return (
        <Card variant='outlined'>
            <CardContent  sx={{p:0}}>
                <Tweet id={tweet.id} />
            </CardContent>
        </Card>
    );
};

export default TweetCard;