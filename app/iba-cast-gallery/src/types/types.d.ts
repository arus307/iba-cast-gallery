declare global {
    type Cast = {
        id:number;
        name:string;
        enName:string;
        introduceTweetId:string;
        color:string;
        type:CastType;
    };

    type CastType = "REAL" | "IMAGINARY";    

    type CastMediaTweet = {
        id: string;
        postedAt: string;
        taggedCastIds: number[];
    };

    type Db = {
        tweets: CastMediaTweet[];
        casts: Cast[];
    };

    type JoinedCastMediaTweet = Pick<CastMediaTweet, "id" | "postedAt"> & {
        taggedCasts: Cast[];
    };

    type JoinedDb = {
        tweets: JoinedCastMediaTweet[];
        casts: Cast[];
    }
}

export {Cast, CastMediaTweet, Db};
