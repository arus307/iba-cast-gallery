import { NextResponse } from "next/server";
import { getAllCasts } from "services/castService";
import { auth } from "auth";
import { createWithLogging, Logger } from "@iba-cast-gallery/logger";

const withLogging = createWithLogging({ auth });

export const GET = withLogging(async (_req: NextRequest, _ctx: { params: {} }, logger: Logger) => {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const casts = await getAllCasts(logger);
    return NextResponse.json(casts, { status: 200 });
});