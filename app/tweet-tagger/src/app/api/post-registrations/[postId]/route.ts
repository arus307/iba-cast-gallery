import { NextResponse } from "next/server";
import { auth } from "auth";
import { getPostRegistrationDetail } from "services/postRegistrationQueryService";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ postId: string }> },
) {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const detail = await getPostRegistrationDetail(
            (await params).postId,
        );
        if (!detail) {
            return NextResponse.json(
                { error: "ポストが存在しません" },
                { status: 404 },
            );
        }

        return NextResponse.json(detail, { status: 200 });
    } catch (error) {
        console.error("Error fetching post registration detail:", error);
        return NextResponse.json(
            { error: "Failed to fetch post registration detail" },
            { status: 500 },
        );
    }
}
