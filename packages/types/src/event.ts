export enum EventType {
    CAST_EVENT = "cast_event",
    KAMITSUBAKI = "kamitsubaki",
    COLLAB = "collab",
}

export interface EventDto {
    id: number;
    eventType: EventType;
    title: string;
    dateStart: string;
    dateEnd: string;
    timeNote: string | null;
    notes: string | null;
    sourcePostId: string | null;
    casts: { id: number; name: string }[];
}
