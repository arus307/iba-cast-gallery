"use server";

import { auth } from "src/auth";
import { Grid2, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import NotAdmin from "../client-component/NotAdmin";
import { getAllPosts } from "@/services/postService";
import { Tweet } from "react-tweet";
import dayjs from "dayjs";
import Link from "next/link";

export default async function Home() {

    const session = await auth();
    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
        return (
            <NotAdmin />
        );
    }

    const posts = await getAllPosts();

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                <Typography>登録済みポスト一覧</Typography>

                <Grid2 container spacing={2} className="w-full">
                    {posts.map((post) => (
                        <Grid2 key={post.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
                            <div className="border p-4 rounded">
                                {
                                    post.isDeleted ? (
                                        <Typography variant="body2" color="error">削除済み</Typography>
                                    ) : (
                                        <Tweet id={post.id} />
                                    )
                                }
                                <Typography variant="body2">{post.id}</Typography>
                                <Typography variant="body2">{dayjs(post.postedAt).format('YYYY-MM-DD hh:mm:ss')}</Typography>
                                <Typography variant="body2">{post.taggedCasts.map(cast => cast.name).join(", ")}</Typography>
                                <Link href={`/posts/${post.id}/edit`}>
                                    <Typography variant="body2" color="primary">編集</Typography>
                                </Link>
                            </div>
                        </Grid2>
                    ))}
                </Grid2>
            </main>
        </div>
    );
}
