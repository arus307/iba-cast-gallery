import { Dayjs } from "dayjs";

declare global {
    type Cast = {
        id:number;
        name:string;
        enName:string;
        introduceTweetId:string;
        color:string;
        type:CastType;
    };

    type CastMediaTweet = {
        id: string;
        postedAt: Dayjs;
        taggedCastIds: number[];
    };

    type Db = {
        tweets: CastMediaTweet[];
        casts: Cast[];
    };

    type CastType = "REAL" | "IMAGINARY";    
}

export {Cast, CastMediaTweet, Db};
