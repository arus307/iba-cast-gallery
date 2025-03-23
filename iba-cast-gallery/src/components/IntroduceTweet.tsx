import { Tweet } from "./tweet/swr";

/**
 * 自己紹介ツイート用コンポーネント
 */
const IntroduceTweet = ({cast} : {cast:Cast})=>{
    return (
        <Tweet id={cast.introduceTweetId} taggedCasts={[cast]}/>
    );
};

export default IntroduceTweet;
