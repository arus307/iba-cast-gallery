export enum ShiftSlot {
    OPEN = "open",
    EVENING = "evening",
    NIGHT = "night",
}

export enum ShiftSourceStatus {
    PENDING = "pending",
    DONE = "done",
}

export interface ShiftDto {
    id: number;
    date: string;
    shift: ShiftSlot;
    castId: number;
    sourcePostId: string | null;
}

export interface ShiftGroup {
    date: string;
    dayOfWeek: string;
    shift: ShiftSlot;
    casts: { id: number; name: string; type: string }[];
    sourcePostId: string | null;
}

export interface ShiftPostCandidate {
    id: string;
    postedAt: string;
    inferredShift: ShiftSlot;
    differenceMinutes: number;
    taggedCasts: { id: number; name: string; order: number }[];
}
