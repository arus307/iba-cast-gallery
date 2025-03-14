import { Dayjs } from "dayjs";

type Cast = {
    id:number;
    name:string;
    introduceTweetId:string;
    color:string;
};

type CastMediaTweet = {
    id: string;
    postedAt: Dayjs;    
};