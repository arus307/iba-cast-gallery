import { NextResponse } from "next/server";
import { auth } from "auth";
import { EventType } from "@iba-cast-gallery/types";
import { getAllEvents, createEvent } from "services/eventService";

/**
 * GET /api/events
 * イベント一覧を取得する
 */
export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const events = await getAllEvents();
        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

/**
 * POST /api/events
 * イベントを登録する
 */
export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

        const event = await createEvent({ eventType, title, dateStart, dateEnd, timeNote, notes, sourcePostId, castIds });
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
