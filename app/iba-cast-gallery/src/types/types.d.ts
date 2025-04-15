declare global {
    interface JoinedPost {
        id: string;
        postedAt: string;
        taggedCasts: CastDto[];
    }
}

export {Cast, CastMediaTweet, Db};
