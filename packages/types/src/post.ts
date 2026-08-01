import {CastDto} from "./cast";

export enum PostContentType {
    GALLERY = "gallery",
    BLOG = "blog",
}

export interface PostDto {
    id: string;
    postedAt: string;
    contentType: PostContentType;
    taggedCasts: {
        order:number;
        castId: number;
    }[];
}

export interface PostWithCastsDto {
    id: string;
    postedAt: string;
    contentType: PostContentType;
    taggedCasts: {
        order: number;
        cast: CastDto;
    }[];
}
