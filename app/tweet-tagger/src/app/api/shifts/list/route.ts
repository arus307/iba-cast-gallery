import { NextResponse } from "next/server";
import { auth } from "auth";
import { getShiftList } from "services/shiftService";

/**
 * GET /api/shifts/list
 * 全シフト記録を一覧で取得する（日付降順）
 */
export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const list = await getShiftList();
        return NextResponse.json(list, { status: 200 });
    } catch (error) {
        console.error("Error fetching shift list:", error);
        return NextResponse.json({ error: "Failed to fetch shift list" }, { status: 500 });
    }
}
