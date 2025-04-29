import { NextResponse } from "next/server";
import { getAllCasts } from "@/services/castService";

export async function GET() {
    try {
        const casts = await getAllCasts();
        return NextResponse.json(casts, { status: 200 });
    } catch (error) {
        console.error("Error fetching casts:", error);
        return NextResponse.json({ error: "Failed to fetch casts" }, { status: 500 });
    }
}