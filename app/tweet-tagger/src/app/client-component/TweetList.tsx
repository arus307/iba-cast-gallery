"use client";

import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TablePagination,
    TextField,
    Typography,
} from "@mui/material";
import { PostContentType } from "@iba-cast-gallery/types";
import type { PostManagementSummary } from "@iba-cast-gallery/types";
import PostManagementCard from "components/PostManagementCard";
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
} from "react";

type UsageFilter =
    | "all"
    | "gallery"
    | "gallery-without-shift"
    | "blog"
    | "shift"
    | "unassigned";
type VisibilityFilter = "all" | "visible" | "hidden" | "deleted";

const INITIAL_ROWS_PER_PAGE = 12;

const TweetList = () => {
    const [posts, setPosts] = useState<PostManagementSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [usage, setUsage] = useState<UsageFilter>("all");
    const [visibility, setVisibility] = useState<VisibilityFilter>("all");
    const [castId, setCastId] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(INITIAL_ROWS_PER_PAGE);
    const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("ja"));

    const handleShiftRegistrationExclusionChange = useCallback(
        (postId: string, excludeFromShiftRegistration: boolean) => {
            setPosts((current) =>
                current.map((item) =>
                    item.id === postId
                        ? { ...item, excludeFromShiftRegistration }
                        : item,
                ),
            );
        },
        [],
    );

    useEffect(() => {
        const controller = new AbortController();

        const fetchPosts = async () => {
            try {
                const response = await fetch("/api/post-summaries", {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data: PostManagementSummary[] = await response.json();
                setPosts(data);
            } catch (fetchError) {
                if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
                    return;
                }
                console.error("Error fetching post summaries:", fetchError);
                setError("登録済みポストの読み込みに失敗しました");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchPosts();
        return () => controller.abort();
    }, []);

    const casts = useMemo(() => {
        const castMap = new Map<number, string>();
        for (const post of posts) {
            for (const cast of post.taggedCasts) {
                castMap.set(cast.id, cast.name);
            }
            for (const shift of post.shifts) {
                for (const cast of shift.casts) {
                    castMap.set(cast.id, cast.name);
                }
            }
        }
        return Array.from(castMap, ([id, name]) => ({ id, name })).toSorted((a, b) =>
            a.name.localeCompare(b.name, "ja"),
        );
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const isGallery =
                post.contentType === PostContentType.GALLERY &&
                (post.showInGallery || post.taggedCasts.length > 0);
            const isBlog = post.contentType === PostContentType.BLOG;
            const isShift = post.shiftSource !== null || post.shifts.length > 0;
            const needsShiftRegistration =
                isGallery &&
                !isShift &&
                !post.isDeleted &&
                !post.excludeFromShiftRegistration;

            const matchesUsage =
                usage === "all" ||
                (usage === "gallery" && isGallery) ||
                (usage === "gallery-without-shift" && needsShiftRegistration) ||
                (usage === "blog" && isBlog) ||
                (usage === "shift" && isShift) ||
                (usage === "unassigned" && !isGallery && !isBlog && !isShift);

            const matchesVisibility =
                visibility === "all" ||
                (visibility === "visible" && post.showInGallery && !post.isDeleted) ||
                (visibility === "hidden" && !post.showInGallery && !post.isDeleted) ||
                (visibility === "deleted" && post.isDeleted);

            const numericCastId = Number(castId);
            const matchesCast =
                castId === "all" ||
                post.taggedCasts.some((cast) => cast.id === numericCastId) ||
                post.shifts.some((shift) =>
                    shift.casts.some((cast) => cast.id === numericCastId),
                );

            const searchableText = [
                post.id,
                post.postedAt,
                ...post.taggedCasts.map((cast) => cast.name),
                ...post.shifts.flatMap((shift) => [
                    shift.date,
                    shift.dayOfWeek,
                    ...shift.casts.map((cast) => cast.name),
                ]),
            ]
                .join(" ")
                .toLocaleLowerCase("ja");
            const matchesQuery =
                deferredQuery.length === 0 || searchableText.includes(deferredQuery);

            return matchesUsage && matchesVisibility && matchesCast && matchesQuery;
        });
    }, [castId, deferredQuery, posts, usage, visibility]);

    useEffect(() => {
        setPage(0);
    }, [castId, deferredQuery, rowsPerPage, usage, visibility]);

    const visiblePosts = filteredPosts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="ポストID・キャスト名・シフト日付を検索"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            slotProps={{ htmlInput: { "data-testid": "post-search-input" } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="post-usage-filter-label">登録用途</InputLabel>
                            <Select
                                labelId="post-usage-filter-label"
                                label="登録用途"
                                value={usage}
                                onChange={(event) => setUsage(event.target.value as UsageFilter)}
                                data-testid="post-usage-filter"
                            >
                                <MenuItem value="all">すべて</MenuItem>
                                <MenuItem value="gallery">ギャラリー</MenuItem>
                                <MenuItem value="gallery-without-shift">
                                    ギャラリー（シフト未登録）
                                </MenuItem>
                                <MenuItem value="blog">BLOG</MenuItem>
                                <MenuItem value="shift">シフト</MenuItem>
                                <MenuItem value="unassigned">用途未設定</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="post-visibility-filter-label">表示状態</InputLabel>
                            <Select
                                labelId="post-visibility-filter-label"
                                label="表示状態"
                                value={visibility}
                                onChange={(event) =>
                                    setVisibility(event.target.value as VisibilityFilter)
                                }
                                data-testid="post-visibility-filter"
                            >
                                <MenuItem value="all">すべて</MenuItem>
                                <MenuItem value="visible">ギャラリー表示中</MenuItem>
                                <MenuItem value="hidden">ギャラリー非表示</MenuItem>
                                <MenuItem value="deleted">削除済み</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="post-cast-filter-label">キャスト</InputLabel>
                            <Select
                                labelId="post-cast-filter-label"
                                label="キャスト"
                                value={castId}
                                onChange={(event) => setCastId(event.target.value)}
                                data-testid="post-cast-filter"
                            >
                                <MenuItem value="all">すべて</MenuItem>
                                {casts.map((cast) => (
                                    <MenuItem key={cast.id} value={String(cast.id)}>
                                        {cast.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="body2" color="text.secondary" aria-live="polite">
                {`${filteredPosts.length}件 / 全${posts.length}件`}
            </Typography>

            {visiblePosts.length > 0 ? (
                <Grid container spacing={2} className="w-full">
                    {visiblePosts.map((post, index) => (
                        <Grid
                            key={post.id}
                            size={{ xs: 12, lg: 6 }}
                            data-testid={`tweet-list-item-${index + 1}`}
                        >
                            <PostManagementCard
                                post={post}
                                onShiftRegistrationExclusionChange={
                                    handleShiftRegistrationExclusionChange
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Alert severity="info">条件に一致するポストはありません</Alert>
            )}

            <TablePagination
                component="div"
                count={filteredPosts.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => setRowsPerPage(Number(event.target.value))}
                rowsPerPageOptions={[12, 24, 48]}
                labelRowsPerPage="1ページの件数"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                showFirstButton
                showLastButton
            />
        </Stack>
    );
};

export default TweetList;
