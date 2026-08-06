import { NextResponse } from "next/server";
import { auth } from "auth";
import { getPostManagementSummaries } from "services/postService";

export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const posts = await getPostManagementSummaries();
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error("Error fetching post management summaries:", error);
        return NextResponse.json(
            { error: "Failed to fetch post management summaries" },
            { status: 500 },
        );
    }
}
