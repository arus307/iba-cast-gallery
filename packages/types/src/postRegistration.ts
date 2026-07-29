import { ShiftSlot } from "./shift";

export interface ShiftRegistrationInput {
    date?: string;
    slot?: ShiftSlot;
}

export interface PostRegistrationRequest {
    postId: string;
    postedAt?: string;
    isDeleted?: boolean;
    destinations: {
        gallery: boolean;
        shift: boolean;
    };
    taggedCastIds: number[];
    shiftCastIds: number[];
    shift?: ShiftRegistrationInput;
}

export interface PostRegistrationResult {
    postId: string;
    shift: {
        date: string;
        slot: ShiftSlot;
    } | null;
}
