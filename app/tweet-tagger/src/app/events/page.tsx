"use server";

import { auth } from "auth";
import { redirect } from "next/navigation";
import { Typography } from "@mui/material";
import Link from "next/link";
import NotAdmin from "app/client-component/NotAdmin";
import EventPageContent from "app/client-component/EventPageContent";

export default async function EventsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }
    if (session.user.email !== process.env.ADMIN_EMAIL) {
        return <NotAdmin />;
    }

    return (
        <>
            <Link href="/">
                <Typography variant="body2" color="primary">← 登録画面へ</Typography>
            </Link>
            <Link href="/api/events/export" prefetch={false}>
                <Typography variant="body2" color="primary">events.csv をダウンロード</Typography>
            </Link>
            <Typography variant="h6">イベント登録</Typography>
            <EventPageContent />
        </>
    );
}
