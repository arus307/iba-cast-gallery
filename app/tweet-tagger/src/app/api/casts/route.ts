import { NextResponse } from "next/server";
import {
    createCast,
    DuplicateCastError,
    getAllCasts,
} from "services/castService";
import { auth } from "auth";
import { CastType } from "@iba-cast-gallery/types";
import { extractPostId } from "utils/postId";

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

export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const name = typeof values.name === "string" ? values.name.trim() : "";
    const enName = typeof values.enName === "string" ? values.enName.trim() : "";
    const introduceTweetId = typeof values.introduceTweetId === "string"
        ? extractPostId(values.introduceTweetId)
        : null;
    const fanMark = typeof values.fanMark === "string" ? values.fanMark.trim() : "";
    const type = values.type;
    const isActive = values.isActive;

    if (!name || name.length > 30) {
        return NextResponse.json({ error: "Name must be between 1 and 30 characters" }, { status: 400 });
    }
    if (!enName || enName.length > 30) {
        return NextResponse.json({ error: "English name must be between 1 and 30 characters" }, { status: 400 });
    }
    if (!introduceTweetId) {
        return NextResponse.json({ error: "Invalid introduction post URL or ID" }, { status: 400 });
    }
    if (fanMark.length > 20) {
        return NextResponse.json({ error: "Fan mark must be 20 characters or fewer" }, { status: 400 });
    }
    if (type !== CastType.REAL && type !== CastType.IMAGINARY) {
        return NextResponse.json({ error: "Invalid cast type" }, { status: 400 });
    }
    if (typeof isActive !== "boolean") {
        return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    try {
        const cast = await createCast({
            name,
            enName,
            introduceTweetId,
            type,
            isActive,
            fanMark: fanMark || "-",
        });
        return NextResponse.json(cast, { status: 201 });
    } catch (error) {
        if (error instanceof DuplicateCastError) {
            return NextResponse.json(
                { error: "A cast with the same name, English name, or introduction post already exists" },
                { status: 409 },
            );
        }
        console.error("Error creating cast:", error);
        return NextResponse.json({ error: "Failed to create cast" }, { status: 500 });
    }
}
