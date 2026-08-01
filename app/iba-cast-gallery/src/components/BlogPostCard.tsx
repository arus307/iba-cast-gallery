"use client";

import { ArticleOutlined, OpenInNew } from "@mui/icons-material";
import Image from "next/image";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { PostWithCastsDto } from "@iba-cast-gallery/types";
import CastChip from "components/CastChip";
import { useTweet } from "components/tweet/hooks";
import { getMediaUrl } from "components/tweet/utils";

const getPostUrl = (postId: string) =>
  `https://x.com/IBA_diary/status/${postId}`;

/**
 * IBAだいありぃのBLOGポストを、画像ギャラリーとは別のテキスト中心カードで表示する。
 */
export default function BlogPostCard({ post }: { post: PostWithCastsDto }) {
  const { data: tweet, error, isLoading } = useTweet(post.id);
  const publishedAt = dayjs(post.postedAt).format("YYYY年M月D日");
  const photos =
    tweet?.mediaDetails?.filter((media) => media.type === "photo") ?? [];

  return (
    <Card
      variant="outlined"
      data-testid={`blog-post-card-${post.id}`}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ArticleOutlined color="primary" fontSize="small" />
            <Chip label="IBAだいありぃ BLOG" color="primary" size="small" />
          </Stack>
          <Typography variant="subtitle2" color="text.secondary">
            {publishedAt}
          </Typography>
          {isLoading && (
            <>
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" height={84} />
            </>
          )}
          {!isLoading && photos.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  photos.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                gap: 0.5,
              }}
            >
              {photos.map((photo, index) => (
                <Box
                  key={photo.media_url_https}
                  component="a"
                  href={getMediaUrl(photo, "large")}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    aspectRatio: `${photo.original_info.width} / ${photo.original_info.height}`,
                    borderRadius: 1,
                    display: "block",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={getMediaUrl(photo, "medium")}
                    alt={photo.ext_alt_text || `${publishedAt}のBLOG画像 ${index + 1}`}
                    data-testid={`blog-post-image-${post.id}-${index}`}
                    fill
                    sizes={
                      photos.length === 1
                        ? "(max-width: 900px) 100vw, 33vw"
                        : "(max-width: 900px) 50vw, 17vw"
                    }
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>
          )}
          {!isLoading && tweet && (
            <Typography
              variant="body1"
              component="p"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0 }}
            >
              {tweet.text}
            </Typography>
          )}
          {!isLoading && (!tweet || error) && (
            <Typography variant="body2" color="text.secondary">
              BLOGポストの本文を取得できませんでした。Xで本文を確認できます。
            </Typography>
          )}
          {post.taggedCasts.length > 0 && (
            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
              {post.taggedCasts
                .sort((a, b) => a.order - b.order)
                .map(({ cast, order }) => (
                  <CastChip key={cast.id} cast={cast} dataTestId={`blog-cast-tag-${order}`} />
                ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          component="a"
          href={getPostUrl(post.id)}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNew />}
          size="small"
        >
          XでBLOGを読む
        </Button>
      </CardActions>
    </Card>
  );
}
