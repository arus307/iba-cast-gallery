
export enum CastType {
    REAL = 1,
    IMAGINARY = 2,
}

export interface CastDto {
    id: number;
    name:string;
    enName:string;
    introduceTweetId:string;
    type: CastType;
    fanMark: string;
    taggedPosts: number[];
}