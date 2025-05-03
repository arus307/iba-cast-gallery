import { NextResponse } from "next/server";
import { getAllCasts } from "@/services/castService";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const casts = await getAllCasts();
        return NextResponse.json(casts, { status: 200 });
    } catch (error) {
        console.error("Error fetching casts:", error);
        return NextResponse.json({ error: "Failed to fetch casts" }, { status: 500 });
    }
}