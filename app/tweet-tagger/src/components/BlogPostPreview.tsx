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
import { useTweet } from "./tweet/hooks";

export default function BlogPostPreview({
  postId,
  postedAt,
}: {
  postId: string;
  postedAt: string | null;
}) {
  const postUrl = postId ? `https://x.com/IBA_diary/status/${postId}` : undefined;
  const { data: tweet, error, isLoading } = useTweet(postId || undefined);

  return (
    <Card variant="outlined" data-testid="blog-post-preview">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ArticleOutlined color="primary" fontSize="small" />
            <Chip label="IBAだいありぃ BLOG" color="primary" size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {postedAt ? dayjs(postedAt).format("YYYY年M月D日") : "投稿日時を入力してください"}
          </Typography>
          {!postId && (
            <Typography variant="body2" color="text.secondary">
              XのポストURL または IDを入力すると、本文を確認できます。
            </Typography>
          )}
          {postId && isLoading && <Skeleton variant="text" height={84} />}
          {postId && !isLoading && tweet && (
            <Typography
              variant="body1"
              component="p"
              data-testid="blog-post-preview-text"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0 }}
            >
              {tweet.text}
            </Typography>
          )}
          {postId && !isLoading && (!tweet || error) && (
            <Typography variant="body2" color="text.secondary">
              ポスト本文を取得できませんでした。Xのポストを確認してください。
            </Typography>
          )}
          <Typography variant="body2">
            画像ギャラリーには載せず、BLOG一覧とタグ付けしたキャストのBLOGタブに表示されます。
          </Typography>
        </Stack>
      </CardContent>
      {postUrl && (
        <CardActions>
          <Button
            component="a"
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            endIcon={<OpenInNew />}
          >
            Xのポストを確認
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
