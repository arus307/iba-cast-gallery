export enum EventType {
    CAST_EVENT_SHOP = "cast_event_shop",  // 店舗内（生誕祭など）
    CAST_EVENT_LIVE = "cast_event_live",  // 店舗外ライブ
    KAMITSUBAKI     = "kamitsubaki",
    COLLAB          = "collab",
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
