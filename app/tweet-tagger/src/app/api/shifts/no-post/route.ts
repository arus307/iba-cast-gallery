import { NextResponse } from "next/server";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { auth } from "auth";
import {
    confirmShiftHasNoPost,
    getShiftNoPostConfirmations,
    removeShiftNoPostConfirmation,
} from "services/shiftService";

const isValidDate = (value: string | null): value is string => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const isValidShift = (value: unknown): value is ShiftSlot =>
    typeof value === "string" &&
    Object.values(ShiftSlot).includes(value as ShiftSlot);

const isAdmin = async () => {
    const session = await auth();
    return session?.user?.email === process.env.ADMIN_EMAIL;
};

/**
 * GET /api/shifts/no-post
 * 情報ポストなしとして確認済みの枠を取得する。
 */
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        return NextResponse.json(await getShiftNoPostConfirmations());
    } catch (error) {
        console.error("Error fetching no-post confirmations:", error);
        return NextResponse.json(
            { error: "Failed to fetch no-post confirmations" },
            { status: 500 },
        );
    }
}

/**
 * POST /api/shifts/no-post
 * body: { date: string, shift: ShiftSlot }
 */
export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = (await request.json()) as {
            date?: string;
            shift?: ShiftSlot;
        };
        const date = body.date ?? null;
        const { shift } = body;
        if (!isValidDate(date) || !isValidShift(shift)) {
            return NextResponse.json(
                { error: "有効な date と shift は必須です" },
                { status: 400 },
            );
        }

        const confirmation = await confirmShiftHasNoPost(date, shift);
        return NextResponse.json(confirmation, { status: 201 });
    } catch (error) {
        console.error("Error confirming no shift post:", error);
        return NextResponse.json(
            { error: "Failed to confirm no shift post" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/shifts/no-post?date=2026-08-10&shift=evening
 * 情報ポストなしの確認を取り消す。
 */
export async function DELETE(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");
    if (!isValidDate(date) || !isValidShift(shift)) {
        return NextResponse.json(
            { error: "有効な date と shift は必須です" },
            { status: 400 },
        );
    }

    try {
        const deleted = await removeShiftNoPostConfirmation(date, shift);
        return NextResponse.json({ ok: true, deleted });
    } catch (error) {
        console.error("Error removing no-post confirmation:", error);
        return NextResponse.json(
            { error: "Failed to remove no-post confirmation" },
            { status: 500 },
        );
    }
}
