"use client";

import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PostContentType, ShiftSlot } from "@iba-cast-gallery/types";
import type { PostManagementSummary } from "@iba-cast-gallery/types";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useState } from "react";

const BlogPostPreview = dynamic(() => import("components/BlogPostPreview"), {
    loading: () => <CircularProgress size={24} />,
});
const TweetPreview = dynamic(
    () => import("components/tweet/swr").then((module) => module.Tweet),
    { loading: () => <CircularProgress size={24} /> },
);

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const PostManagementCard = ({ post }: { post: PostManagementSummary }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const isGallery =
        post.contentType === PostContentType.GALLERY &&
        (post.showInGallery || post.taggedCasts.length > 0);
    const isBlog = post.contentType === PostContentType.BLOG;
    const isShift = post.shiftSource !== null || post.shifts.length > 0;

    const visibilityLabel = post.isDeleted
        ? "削除済み"
        : post.showInGallery
            ? "表示中"
            : isShift
                ? "ギャラリー非表示"
                : "ドラフト";
    const visibilityColor = post.isDeleted
        ? "error"
        : post.showInGallery
            ? "success"
            : "warning";

    return (
        <Card
            variant="outlined"
            data-testid={`post-summary-${post.id}`}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                    >
                        <Typography variant="body2" color="text.secondary">
                            {dayjs(post.postedAt).format("YYYY-MM-DD HH:mm:ss")}
                        </Typography>
                        <Chip
                            label={visibilityLabel}
                            color={visibilityColor}
                            size="small"
                        />
                    </Stack>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            ポストID
                        </Typography>
                        <Link
                            href={`https://x.com/i/status/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                            {post.id}
                            <OpenInNewIcon fontSize="inherit" />
                        </Link>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            登録用途
                        </Typography>
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {isGallery ? <Chip label="ギャラリー" color="primary" size="small" /> : null}
                            {isBlog ? <Chip label="BLOG" color="secondary" size="small" /> : null}
                            {isShift ? <Chip label="シフト" color="info" size="small" /> : null}
                            {!isGallery && !isBlog && !isShift ? (
                                <Chip label="用途未設定" variant="outlined" size="small" />
                            ) : null}
                            {post.shiftSource ? (
                                <Chip
                                    label={post.shiftSource === "pending" ? "シフト解析待ち" : "シフト解析済み"}
                                    variant="outlined"
                                    size="small"
                                />
                            ) : null}
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            ギャラリー／BLOGのキャストタグ
                        </Typography>
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {post.taggedCasts.length > 0 ? (
                                post.taggedCasts.map((cast) => (
                                    <Chip key={cast.id} label={`${cast.order}. ${cast.name}`} size="small" />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    なし
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            シフト登録
                        </Typography>
                        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                            {post.shifts.length > 0 ? (
                                post.shifts.map((shift) => (
                                    <Typography
                                        key={`${shift.date}-${shift.shift}`}
                                        variant="body2"
                                        data-testid={`post-shift-${post.id}-${shift.date}-${shift.shift}`}
                                    >
                                        {`${shift.date} (${shift.dayOfWeek}) ${SHIFT_LABELS[shift.shift]}：${shift.casts.map((cast) => cast.name).join("、")}`}
                                    </Typography>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    なし
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>

            <Divider />
            <CardActions sx={{ px: 2, py: 1.5 }}>
                <Button
                    size="small"
                    onClick={() => setIsPreviewOpen((current) => !current)}
                    aria-expanded={isPreviewOpen}
                    data-testid={`post-preview-toggle-${post.id}`}
                >
                    {isPreviewOpen ? "プレビューを閉じる" : "Xプレビュー"}
                </Button>
                <Button
                    component={NextLink}
                    href={`/posts/${post.id}/edit`}
                    size="small"
                    variant="outlined"
                >
                    編集
                </Button>
            </CardActions>

            <Collapse in={isPreviewOpen} unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                    {post.contentType === PostContentType.BLOG ? (
                        <BlogPostPreview postId={post.id} postedAt={post.postedAt} />
                    ) : (
                        <TweetPreview id={post.id} taggedCasts={post.taggedCasts} />
                    )}
                </Box>
            </Collapse>
        </Card>
    );
};

export default PostManagementCard;
