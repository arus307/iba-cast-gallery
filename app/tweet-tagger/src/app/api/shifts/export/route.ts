import { NextResponse } from "next/server";
import { auth } from "auth";
import { getAllShiftsForExport } from "services/shiftService";

/**
 * GET /api/shifts/export
 * shifts.csv 形式でダウンロード（iba_predictor.py 互換）
 */
export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rows = await getAllShiftsForExport();

        const header = "date,day_of_week,shift,cast_type,name";
        const lines = rows.map(
            (r) => `${r.date},${r.dayOfWeek},${r.shift},${r.castType},${r.name}`
        );
        const csv = [header, ...lines].join("\n");

        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="shifts.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting shifts:", error);
        return NextResponse.json({ error: "Failed to export shifts" }, { status: 500 });
    }
}
