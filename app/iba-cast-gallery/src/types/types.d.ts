declare global {
    interface JoinedPost {
        id: string;
        postedAt: string;
        taggedCasts: {
            order:number;
            cast:CastDto;
        }[]
    }
}

export {Cast, CastMediaTweet, Db};
