import { NextResponse } from "next/server";
import { auth } from "auth";
import { PostRegistrationRequest } from "@iba-cast-gallery/types";
import {
    PostRegistrationValidationError,
    registerPostWithDestinations,
} from "services/postRegistrationService";

/**
 * POST /api/post-registrations
 * ポストのギャラリー登録とシフト登録をまとめて行う。
 */
export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const registration =
            (await request.json()) as PostRegistrationRequest;
        const result = await registerPostWithDestinations(registration);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof PostRegistrationValidationError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 },
            );
        }

        console.error("Error registering post destinations:", error);
        return NextResponse.json(
            { error: "Failed to register post destinations" },
            { status: 500 },
        );
    }
}
