"use client";

import Grid2 from "@mui/material/Grid2";
import CastSelect from "components/CastSelect";
import { useState } from "react";
import Tweets from "components/Tweets";
import { CastDto } from "@iba-cast-gallery/types";

export default function TweetFilter ({posts, casts}:{posts:JoinedPost[], casts:CastDto[]}) {

    const [selectedCast, setSelectedCast] = useState<CastDto | null>(null);
    const displayPosts = posts.filter((post) => {
        if (selectedCast) {
            return post.taggedCasts.includes(selectedCast);
        } else {
            return true;
        }
    });

    return (
    <Grid2 container spacing={2} className="w-full">
        <Grid2 size={12}>
            <CastSelect casts={casts} selectedCast={selectedCast} setSelectedCast={setSelectedCast} />
        </Grid2>
        <Tweets joinedPosts={displayPosts}/>
    </Grid2>
    );
};
