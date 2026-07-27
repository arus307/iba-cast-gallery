"use server";

import { auth } from "auth";
import { redirect } from "next/navigation";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import NotAdmin from "app/client-component/NotAdmin";
import CastEditor from "app/client-component/CastEditor";

export default async function CastsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }
    if (session.user.email !== process.env.ADMIN_EMAIL) {
        return <NotAdmin />;
    }

    return (
        <Stack spacing={2}>
            <Link href="/">
                <Typography variant="body2" color="primary">← 登録画面へ</Typography>
            </Link>
            <Stack spacing={0.5}>
                <Typography variant="h6">キャスト登録</Typography>
                <Typography variant="body2" color="text.secondary">
                    キャストの基本情報と紹介ポストを登録します。
                </Typography>
            </Stack>
            <CastEditor />
        </Stack>
    );
}
