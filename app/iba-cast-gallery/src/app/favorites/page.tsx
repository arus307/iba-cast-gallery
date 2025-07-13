"use client";

import {useSession} from "next-auth/react";
import {CircularProgress} from "@mui/material";

export default function Favorites() {
        
    const { data: session, status } = useSession();

    if(status === "loading") {
        return (
            <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        );
    }


    if(status !== "authenticated") {
        return (
            <div>
                ログインが必要なページです。
            </div>
        );
    }

    const favoritePosts = fetch('/api/favorites');

    return (
        <div>
            お気に入りページ
        </div>
    );
};
