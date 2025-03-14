import { Dayjs } from "dayjs";

declare global {
    type Cast = {
        id:number;
        name:string;
        introduceTweetId:string;
        color:string;
    };

    type CastMediaTweet = {
        id: string;
        postedAt: Dayjs;
        taggedCastIds: number[];
    };
}

export {};
