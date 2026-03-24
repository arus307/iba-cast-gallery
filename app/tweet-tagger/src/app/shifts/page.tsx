"use server";

import { auth } from "auth";
import { Typography } from "@mui/material";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotAdmin from "app/client-component/NotAdmin";
import ShiftEditor from "app/client-component/ShiftEditor";

export default async function ShiftsPage() {
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
            <Link href="/api/shifts/export" prefetch={false}>
                <Typography variant="body2" color="primary">shifts.csv をダウンロード</Typography>
            </Link>
            <Typography variant="h6">シフト登録</Typography>
            <ShiftEditor />
        </>
    );
}
