import { NextRequest, NextResponse } from "next/server";
import { getAllCasts } from "services/castService";
import { auth } from "auth";
import { Logger, withLogging } from "@iba-cast-gallery/logger";

export const GET = withLogging(async (_: NextRequest, context: { params: {} }, logger: Logger) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const casts = await getAllCasts(logger);
    return NextResponse.json(casts, { status: 200 });
});