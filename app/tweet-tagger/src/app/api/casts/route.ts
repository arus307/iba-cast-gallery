import { NextRequest, NextResponse } from "next/server";
import { getAllCasts } from "services/castService";
import { auth } from "auth";
import { createWithLogging } from "@iba-cast-gallery/logger";

const withLogging = createWithLogging({ auth });

export const GET = withLogging(async (_, __, logger) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const casts = await getAllCasts(logger);
    return NextResponse.json(casts, { status: 200 });
});