declare global {
    interface JoinedPost {
        id: string;
        postedAt: string;
        contentType: import("@iba-cast-gallery/types").PostContentType;
        taggedCasts: {
            order:number;
            cast:CastDto;
        }[]
    }
}

export {Cast, CastMediaTweet, Db};
