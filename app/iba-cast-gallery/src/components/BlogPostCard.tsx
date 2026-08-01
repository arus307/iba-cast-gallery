"use client";

import { ArticleOutlined, OpenInNew } from "@mui/icons-material";
import {
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

const getPostUrl = (postId: string) =>
  `https://x.com/IBA_diary/status/${postId}`;

/**
 * IBAだいありぃのBLOGポストを、画像ギャラリーとは別のテキスト中心カードで表示する。
 */
export default function BlogPostCard({ post }: { post: PostWithCastsDto }) {
  const { data: tweet, error, isLoading } = useTweet(post.id);
  const publishedAt = dayjs(post.postedAt).format("YYYY年M月D日");

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
          {isLoading && <Skeleton variant="text" height={84} />}
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
