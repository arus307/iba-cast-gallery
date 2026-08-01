"use client";

import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { CastDto, PostWithCastsDto } from "@iba-cast-gallery/types";
import BlogPosts from "components/BlogPosts";
import CastSelect from "components/CastSelect";

/** IBAだいありぃ BLOG をキャストタグで絞り込んで表示する。 */
export default function BlogPostFilter({
  posts,
  casts,
}: {
  posts: PostWithCastsDto[];
  casts: CastDto[];
}) {
  const [selectedCast, setSelectedCast] = useState<CastDto | null>(null);
  const displayPosts = useMemo(
    () =>
      selectedCast
        ? posts.filter((post) =>
            post.taggedCasts.some(
              ({ cast }) => cast.id === selectedCast.id,
            ),
          )
        : posts,
    [posts, selectedCast],
  );

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <CastSelect
          casts={casts}
          selectedCast={selectedCast}
          setSelectedCast={setSelectedCast}
        />
      </Box>
      {displayPosts.length > 0 ? (
        <BlogPosts posts={displayPosts} />
      ) : (
        <Typography color="text.secondary">
          このキャストのBLOGポストはまだありません。
        </Typography>
      )}
    </>
  );
}
