import {CastDto} from "./cast";

export interface PostDto {
    id: string;
    postedAt: string;
    taggedCasts: {
        order:number;
        castId: number;
    }[];
}

export interface PostWithCastsDto {
    id: string;
    postedAt: string;
    taggedCasts: {
        order: number;
        cast: CastDto;
    }[];
}