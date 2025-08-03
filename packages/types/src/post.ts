import {CastDto} from "./cast";

export interface PostDto {
    id: string;
    postedAt: string;
    taggedCasts: number[];
}

export interface PostWithCastsDto {
    id: string;
    postedAt: string;
    taggedCasts: CastDto[];
}