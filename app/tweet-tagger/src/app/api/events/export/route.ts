import { NextResponse } from "next/server";
import { auth } from "auth";
import { getAllEventsForExport } from "services/eventService";

/**
 * GET /api/events/export
 * events.csv 形式でダウンロード（iba_predictor.py 互換）
 * カラム: event_type,title,date_start,date_end,related_cast,notes
 */
export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rows = await getAllEventsForExport();

        // RFC 4180: フィールド内にカンマ・ダブルクォート・改行が含まれる場合はダブルクォートで囲む
        const escapeField = (value: string | null | undefined): string => {
            const str = value ?? "";
            if (/[",\n\r]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const header = "event_type,title,date_start,date_end,related_cast,notes";
        const lines = rows.map(
            (r) =>
                [r.eventType, r.title, r.dateStart, r.dateEnd, r.relatedCast, r.notes]
                    .map(escapeField)
                    .join(",")
        );
        const csv = [header, ...lines].join("\n");

        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="events.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting events:", error);
        return NextResponse.json({ error: "Failed to export events" }, { status: 500 });
    }
}
