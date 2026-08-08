"use client";

import {
    Alert,
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
import { useEffect, useRef, useState } from "react";

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

type PostManagementCardProps = {
    post: PostManagementSummary;
    onShiftRegistrationExclusionChange: (
        postId: string,
        excludeFromShiftRegistration: boolean,
    ) => void;
};

const PostManagementCard = ({
    post,
    onShiftRegistrationExclusionChange,
}: PostManagementCardProps) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [isUpdatingShiftExclusion, setIsUpdatingShiftExclusion] = useState(false);
    const [shiftExclusionError, setShiftExclusionError] = useState("");
    const isGallery =
        post.contentType === PostContentType.GALLERY &&
        (post.showInGallery || post.taggedCasts.length > 0);
    const isBlog = post.contentType === PostContentType.BLOG;
    const isShift = post.shiftSource !== null || post.shifts.length > 0;
    const canChangeShiftExclusion = isGallery && !isShift && !post.isDeleted;

    useEffect(() => {
        const card = cardRef.current;
        if (!card || hasEnteredViewport) {
            return;
        }

        if (!("IntersectionObserver" in window)) {
            setHasEnteredViewport(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) {
                    return;
                }
                setHasEnteredViewport(true);
                observer.disconnect();
            },
            { rootMargin: "400px 0px" },
        );
        observer.observe(card);
        return () => observer.disconnect();
    }, [hasEnteredViewport]);

    const togglePreview = () => {
        if (!hasEnteredViewport) {
            setHasEnteredViewport(true);
            setIsPreviewOpen(true);
            return;
        }
        setHasEnteredViewport(true);
        setIsPreviewOpen((current) => !current);
    };

    const updateShiftRegistrationExclusion = async () => {
        if (isUpdatingShiftExclusion) {
            return;
        }

        const nextValue = !post.excludeFromShiftRegistration;
        setIsUpdatingShiftExclusion(true);
        setShiftExclusionError("");
        try {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    excludeFromShiftRegistration: nextValue,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            onShiftRegistrationExclusionChange(post.id, nextValue);
        } catch (error) {
            console.error("Error updating shift registration exclusion:", error);
            setShiftExclusionError("シフト登録対象の更新に失敗しました");
        } finally {
            setIsUpdatingShiftExclusion(false);
        }
    };

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
            ref={cardRef}
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
                            {canChangeShiftExclusion ? (
                                <Chip
                                    label={
                                        post.excludeFromShiftRegistration
                                            ? "シフト登録対象外"
                                            : "シフト未登録"
                                    }
                                    color={
                                        post.excludeFromShiftRegistration
                                            ? "default"
                                            : "warning"
                                    }
                                    variant={
                                        post.excludeFromShiftRegistration
                                            ? "outlined"
                                            : "filled"
                                    }
                                    size="small"
                                />
                            ) : null}
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
            {shiftExclusionError ? (
                <Alert severity="error" sx={{ mx: 2, mt: 1.5 }}>
                    {shiftExclusionError}
                </Alert>
            ) : null}
            <CardActions sx={{ px: 2, py: 1.5, flexWrap: "wrap", gap: 0.5 }}>
                <Button
                    size="small"
                    onClick={togglePreview}
                    aria-expanded={hasEnteredViewport && isPreviewOpen}
                    data-testid={`post-preview-toggle-${post.id}`}
                >
                    {hasEnteredViewport && isPreviewOpen
                        ? "ポストを閉じる"
                        : "ポストを表示"}
                </Button>
                <Button
                    component={NextLink}
                    href={`/posts/${post.id}/edit`}
                    size="small"
                    variant="outlined"
                >
                    編集
                </Button>
                {canChangeShiftExclusion ? (
                    <Button
                        size="small"
                        color={
                            post.excludeFromShiftRegistration
                                ? "primary"
                                : "inherit"
                        }
                        onClick={() => void updateShiftRegistrationExclusion()}
                        disabled={isUpdatingShiftExclusion}
                        data-testid={`post-shift-exclusion-toggle-${post.id}`}
                    >
                        {isUpdatingShiftExclusion
                            ? "更新中..."
                            : post.excludeFromShiftRegistration
                                ? "シフト登録候補に戻す"
                                : "シフト登録対象外にする"}
                    </Button>
                ) : null}
            </CardActions>

            <Collapse in={hasEnteredViewport && isPreviewOpen} unmountOnExit>
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
