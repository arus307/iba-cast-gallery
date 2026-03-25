import { NextResponse } from "next/server";
import { auth } from "auth";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { updateShiftSource } from "services/shiftService";

/**
 * PATCH /api/shifts/source
 * 指定日・シフトの source_post_id を更新する
 * body: { date: string, shift: ShiftSlot, sourcePostId: string }
 */
export async function PATCH(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { date, shift, sourcePostId } = body as {
            date: string;
            shift: ShiftSlot;
            sourcePostId: string;
        };

        if (!date || !shift || !Object.values(ShiftSlot).includes(shift) || !sourcePostId) {
            return NextResponse.json({ error: "date, shift, sourcePostId は必須です" }, { status: 400 });
        }

        await updateShiftSource(date, shift, sourcePostId);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error updating shift source:", error);
        return NextResponse.json({ error: "Failed to update shift source" }, { status: 500 });
    }
}
