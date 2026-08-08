import { CastDto, CastType } from "./cast";
import { ShiftSlot, ShiftSourceStatus } from "./shift";

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

export interface PostManagementSummary {
    id: string;
    postedAt: string;
    isDeleted: boolean;
    showInGallery: boolean;
    contentType: PostContentType;
    shiftSource: ShiftSourceStatus | null;
    excludeFromShiftRegistration: boolean;
    taggedCasts: {
        id: number;
        name: string;
        type: CastType;
        order: number;
    }[];
    shifts: {
        date: string;
        dayOfWeek: string;
        shift: ShiftSlot;
        casts: { id: number; name: string }[];
    }[];
}
