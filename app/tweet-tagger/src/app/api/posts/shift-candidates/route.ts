import { NextResponse } from "next/server";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { auth } from "auth";
import { getShiftPostCandidates } from "services/shiftService";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/posts/shift-candidates?date=2026-08-07&shift=evening
 * 未登録シフトに利用できる近い時間帯の既存ポストを取得する。
 */
export async function GET(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift") as ShiftSlot | null;
    const parsedDate = date ? new Date(`${date}T00:00:00+09:00`) : null;

    if (
        !date ||
        !DATE_PATTERN.test(date) ||
        !parsedDate ||
        Number.isNaN(parsedDate.getTime()) ||
        !shift ||
        !Object.values(ShiftSlot).includes(shift)
    ) {
        return NextResponse.json(
            { error: "有効な date と shift は必須です" },
            { status: 400 },
        );
    }

    try {
        const candidates = await getShiftPostCandidates(date, shift);
        return NextResponse.json(candidates, { status: 200 });
    } catch (error) {
        console.error("Error fetching shift post candidates:", error);
        return NextResponse.json(
            { error: "Failed to fetch shift post candidates" },
            { status: 500 },
        );
    }
}
