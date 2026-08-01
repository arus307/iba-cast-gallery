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
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTweet } from "react-tweet";
import type { PostWithCastsDto } from "@iba-cast-gallery/types";
import CastChip from "components/CastChip";
import { getMediaUrl } from "components/tweet/utils";

const getPostUrl = (postId: string) =>
  `https://x.com/IBA_diary/status/${postId}`;

type TweetWithNote = {
  note_tweet?: {
    id?: string;
  };
};

const hasUnfetchedContinuation = (tweet: unknown) =>
  typeof (tweet as TweetWithNote | undefined)?.note_tweet?.id === "string";

/**
 * IBAだいありぃのBLOGポストを、画像ギャラリーとは別のテキスト中心カードで表示する。
 */
export default function BlogPostCard({ post }: { post: PostWithCastsDto }) {
  const { data: tweet, error, isLoading } = useTweet(post.id);
  const publishedAt = dayjs(post.postedAt).format("YYYY年M月D日");
  const photos =
    tweet?.mediaDetails?.filter((media) => media.type === "photo") ?? [];
  const hasContinuation = hasUnfetchedContinuation(tweet);

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
              <Skeleton variant="text" height={84} />
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} />
            </>
          )}
          {!isLoading && tweet && (
            <Typography
              variant="body1"
              component="p"
              sx={{
                m: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {tweet.text}
            </Typography>
          )}
          {!isLoading && hasContinuation && (
            <Button
              component="a"
              href={getPostUrl(post.id)}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              endIcon={<OpenInNew />}
              data-testid={`blog-post-continue-${post.id}`}
              sx={{ alignSelf: "flex-start", px: 0 }}
            >
              Xで続きを読む
            </Button>
          )}
          {!isLoading && (!tweet || error) && (
            <Typography variant="body2" color="text.secondary">
              BLOGポストの本文を取得できませんでした。Xで本文を確認できます。
            </Typography>
          )}
          {!isLoading && photos.length > 0 && (
            <PhotoProvider
              overlayRender={({ index }) => {
                const photo = photos.at(index);
                if (!photo?.ext_alt_text) {
                  return null;
                }

                return (
                  <Paper
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      bottom: 0,
                      p: 3,
                      position: "absolute",
                      width: "100%",
                      zIndex: 10,
                    }}
                  >
                    <Typography>{photo.ext_alt_text}</Typography>
                  </Paper>
                );
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    photos.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                  gap: 0.5,
                }}
              >
                {photos.map((photo, index) => (
                  <PhotoView key={photo.media_url_https} src={getMediaUrl(photo, "large")}>
                    <Box
                      component="button"
                      type="button"
                      aria-label={`${publishedAt}のBLOG画像 ${index + 1}を拡大表示`}
                      sx={{
                        aspectRatio: `${photo.original_info.width} / ${photo.original_info.height}`,
                        backgroundColor: "transparent",
                        border: 0,
                        borderRadius: 1,
                        cursor: "zoom-in",
                        display: "block",
                        overflow: "hidden",
                        p: 0,
                        position: "relative",
                        width: "100%",
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
                  </PhotoView>
                ))}
              </Box>
            </PhotoProvider>
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
