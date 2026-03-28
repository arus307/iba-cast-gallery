import { NextResponse } from "next/server";
import { auth } from "auth";
import { EventType } from "@iba-cast-gallery/types";
import { getEventById, updateEvent, deleteEvent } from "services/eventService";

/**
 * GET /api/events/[eventId]
 * イベントを1件取得する
 */
export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const id = Number(eventId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    try {
        const event = await getEventById(id);
        if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

/**
 * PUT /api/events/[eventId]
 * イベントを更新する
 */
export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const id = Number(eventId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    try {
        const body = await request.json();
        const { eventType, title, dateStart, dateEnd, timeNote, notes, sourcePostId, castIds } = body as {
            eventType: EventType;
            title: string;
            dateStart: string;
            dateEnd: string;
            timeNote?: string | null;
            notes?: string | null;
            sourcePostId?: string | null;
            castIds: number[];
        };

        if (!eventType || !Object.values(EventType).includes(eventType) || !title || !dateStart || !dateEnd || !Array.isArray(castIds)) {
            return NextResponse.json({ error: "eventType, title, dateStart, dateEnd, castIds は必須です" }, { status: 400 });
        }

        const event = await updateEvent(id, { eventType, title, dateStart, dateEnd, timeNote, notes, sourcePostId, castIds });
        if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

/**
 * DELETE /api/events/[eventId]
 * イベントを削除する
 */
export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const id = Number(eventId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    try {
        const deleted = await deleteEvent(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
