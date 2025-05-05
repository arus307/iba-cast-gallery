"use server";

import { auth } from "src/auth";
import { Typography } from "@mui/material";
import { redirect } from "next/navigation";
import NotAdmin from "@/app/client-component/NotAdmin";
import Link from "next/link";

export default async function Page(
    { params }: { params: Promise<{ postId: string }> }
) {

    const session = await auth();
    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
        return (
            <NotAdmin />
        );
    }

    const postId = await params.then(p => p.postId);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <Link href="/posts">
                    <Typography variant="body2" color="primary">登録済みポスト一覧</Typography>
                </Link>
                <Typography>編集画面</Typography>
                <Typography>ポストID: {postId}</Typography>
            </main>
        </div>
    );
}
