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
