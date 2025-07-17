"use client";

import Grid2 from "@mui/material/Grid2";
import CastSelect from "components/CastSelect";
import { useState } from "react";
import Tweets from "components/Tweets";
import { CastDto } from "@iba-cast-gallery/types";
import dayjs from "dayjs";

export default function TweetFilter ({posts, casts,favoritePostIds}:{posts:JoinedPost[], casts:CastDto[], favoritePostIds: string[]}) {

    const [selectedCast, setSelectedCast] = useState<CastDto | null>(null);
    const displayPosts = posts.filter((post) => {
        if (selectedCast) {
            return post.taggedCasts.includes(selectedCast);
        } else {
            return true;
        }
    }).sort((a, b) => {
        const diff = dayjs(b.postedAt).diff(dayjs(a.postedAt));
        return diff > 0 ? 1 : diff < 0 ? -1 : 0;
    });

    return (
    <Grid2 container spacing={2} className="w-full">
        <Grid2 size={12}>
            <CastSelect casts={casts} selectedCast={selectedCast} setSelectedCast={setSelectedCast} />
        </Grid2>
        <Tweets joinedPosts={displayPosts} favoritePostIds={favoritePostIds}/>
    </Grid2>
    );
};
