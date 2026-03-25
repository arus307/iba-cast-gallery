import { NextResponse } from "next/server";
import { auth } from "auth";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { getShiftRecord, saveShifts } from "services/shiftService";

/**
 * GET /api/shifts?date=2026-03-24&shift=night
 * 指定日・シフトの記録を取得する
 */
export async function GET(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift") as ShiftSlot | null;

    if (!date || !shift || !Object.values(ShiftSlot).includes(shift)) {
        return NextResponse.json({ error: "date と shift は必須です" }, { status: 400 });
    }

    try {
        const record = await getShiftRecord(date, shift);
        return NextResponse.json(record, { status: 200 });
    } catch (error) {
        console.error("Error fetching shift record:", error);
        return NextResponse.json({ error: "Failed to fetch shift record" }, { status: 500 });
    }
}

/**
 * POST /api/shifts
 * 指定日・シフトのキャストを保存する（洗い替え）
 * body: { date: string, shift: ShiftSlot, castIds: number[], sourcePostId?: string | null }
 */
export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { date, shift, castIds, sourcePostId } = body as {
            date: string;
            shift: ShiftSlot;
            castIds: number[];
            sourcePostId?: string | null;
        };

        if (!date || !shift || !Object.values(ShiftSlot).includes(shift) || !Array.isArray(castIds)) {
            return NextResponse.json({ error: "date, shift, castIds は必須です" }, { status: 400 });
        }

        await saveShifts(date, shift, castIds, sourcePostId ?? null);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error saving shifts:", error);
        return NextResponse.json({ error: "Failed to save shifts" }, { status: 500 });
    }
}
