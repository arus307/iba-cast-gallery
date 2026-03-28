import "server-only";
import "reflect-metadata";
import { initializeDatabase, appDataSource } from "../data-source";
import { Event, EventCastTag, Post, Repository } from "@iba-cast-gallery/dao";
import { EventDto, EventType, ShiftSourceStatus } from "@iba-cast-gallery/types";

function toDto(event: Event): EventDto {
    return {
        id: event.id,
        eventType: event.eventType,
        title: event.title,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        timeNote: event.timeNote,
        notes: event.notes,
        sourcePostId: event.sourcePostId,
        casts: (event.castTags ?? [])
            .sort((a, b) => a.order - b.order)
            .map((tag) => ({ id: tag.castId, name: tag.cast.name })),
    };
}

/**
 * 全イベントを取得する（開始日降順）
 */
export async function getAllEvents(): Promise<EventDto[]> {
    await initializeDatabase();
    const repo: Repository<Event> = appDataSource.getRepository(Event);
    const events = await repo.find({ order: { dateStart: "DESC" } });
    return events.map(toDto);
}

/**
 * イベントを1件取得する
 */
export async function getEventById(id: number): Promise<EventDto | null> {
    await initializeDatabase();
    const repo: Repository<Event> = appDataSource.getRepository(Event);
    const event = await repo.findOne({ where: { id } });
    return event ? toDto(event) : null;
}

/**
 * イベントを登録する
 */
export async function createEvent(params: {
    eventType: EventType;
    title: string;
    dateStart: string;
    dateEnd: string;
    timeNote?: string | null;
    notes?: string | null;
    sourcePostId?: string | null;
    castIds: number[];
}): Promise<EventDto> {
    await initializeDatabase();

    return await appDataSource.transaction(async (em) => {
        // source post の upsert
        if (params.sourcePostId) {
            const postRepo: Repository<Post> = em.getRepository(Post);
            const existing = await postRepo.findOne({ where: { id: params.sourcePostId } });
            if (!existing) {
                await postRepo.insert({
                    id: params.sourcePostId,
                    postedAt: new Date().toISOString(),
                    isDeleted: false,
                    showInGallery: false,
                    shiftSource: ShiftSourceStatus.PENDING,
                });
            }
        }

        const eventRepo: Repository<Event> = em.getRepository(Event);
        const result = await eventRepo.insert({
            eventType: params.eventType,
            title: params.title,
            dateStart: params.dateStart,
            dateEnd: params.dateEnd,
            timeNote: params.timeNote ?? null,
            notes: params.notes ?? null,
            sourcePostId: params.sourcePostId ?? null,
        });
        const eventId = result.identifiers[0].id as number;

        if (params.castIds.length > 0) {
            const tagRepo: Repository<EventCastTag> = em.getRepository(EventCastTag);
            await tagRepo.insert(
                params.castIds.map((castId, i) => ({ eventId, castId, order: i }))
            );
        }

        const event = await em.getRepository(Event).findOneOrFail({ where: { id: eventId } });
        return toDto(event);
    });
}

/**
 * イベントを更新する（キャストタグは洗い替え）
 */
export async function updateEvent(
    id: number,
    params: {
        eventType: EventType;
        title: string;
        dateStart: string;
        dateEnd: string;
        timeNote?: string | null;
        notes?: string | null;
        sourcePostId?: string | null;
        castIds: number[];
    }
): Promise<EventDto | null> {
    await initializeDatabase();

    return await appDataSource.transaction(async (em) => {
        const eventRepo: Repository<Event> = em.getRepository(Event);
        const event = await eventRepo.findOne({ where: { id } });
        if (!event) return null;

        // source post の upsert
        if (params.sourcePostId) {
            const postRepo: Repository<Post> = em.getRepository(Post);
            const existing = await postRepo.findOne({ where: { id: params.sourcePostId } });
            if (!existing) {
                await postRepo.insert({
                    id: params.sourcePostId,
                    postedAt: new Date().toISOString(),
                    isDeleted: false,
                    showInGallery: false,
                    shiftSource: ShiftSourceStatus.PENDING,
                });
            }
        }

        await eventRepo.update(id, {
            eventType: params.eventType,
            title: params.title,
            dateStart: params.dateStart,
            dateEnd: params.dateEnd,
            timeNote: params.timeNote ?? null,
            notes: params.notes ?? null,
            sourcePostId: params.sourcePostId ?? null,
        });

        // キャストタグ洗い替え
        const tagRepo: Repository<EventCastTag> = em.getRepository(EventCastTag);
        await tagRepo.delete({ eventId: id });
        if (params.castIds.length > 0) {
            await tagRepo.insert(
                params.castIds.map((castId, i) => ({ eventId: id, castId, order: i }))
            );
        }

        const updated = await em.getRepository(Event).findOneOrFail({ where: { id } });
        return toDto(updated);
    });
}

/**
 * イベントを削除する
 */
export async function deleteEvent(id: number): Promise<boolean> {
    await initializeDatabase();
    const repo: Repository<Event> = appDataSource.getRepository(Event);
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
}

/**
 * events.csv 用にデータを取得する（iba-predicator 互換フォーマット）
 */
export async function getAllEventsForExport(): Promise<
    { eventType: string; title: string; dateStart: string; dateEnd: string; relatedCast: string; notes: string }[]
> {
    await initializeDatabase();
    const repo: Repository<Event> = appDataSource.getRepository(Event);
    const events = await repo.find({ order: { dateStart: "ASC" } });

    return events.map((ev) => {
        const castNames = (ev.castTags ?? [])
            .sort((a, b) => a.order - b.order)
            .map((tag) => tag.cast.name)
            .join(",");
        return {
            eventType: ev.eventType,
            title: ev.title,
            dateStart: ev.dateStart,
            dateEnd: ev.dateEnd,
            relatedCast: castNames,
            notes: ev.notes ?? "",
        };
    });
}
