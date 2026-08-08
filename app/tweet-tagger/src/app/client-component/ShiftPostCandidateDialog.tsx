"use client";

import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { ShiftSlot } from "@iba-cast-gallery/types";
import type { ShiftPostCandidate } from "@iba-cast-gallery/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Tweet = dynamic(
    () => import("../../components/tweet/swr").then((module) => module.Tweet),
    { loading: () => <CircularProgress size={24} /> },
);

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

export type MissingShiftTarget = {
    date: string;
    dayOfWeek: string;
    slot: ShiftSlot;
};

type ShiftPostCandidateDialogProps = {
    target: MissingShiftTarget | null;
    onClose: () => void;
    onSelect: (sourcePostId: string | null) => void;
};

const POST_TIME_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

const formatPostedAt = (postedAt: string) =>
    POST_TIME_FORMATTER.format(new Date(postedAt));

const formatDifference = (minutes: number) => {
    if (minutes < 60) {
        return `基準時刻から${minutes}分差`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder === 0
        ? `基準時刻から${hours}時間差`
        : `基準時刻から${hours}時間${remainder}分差`;
};

const ShiftPostCandidateDialog = ({
    target,
    onClose,
    onSelect,
}: ShiftPostCandidateDialogProps) => {
    const [candidates, setCandidates] = useState<ShiftPostCandidate[]>([]);
    const [previewPostId, setPreviewPostId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!target) {
            setCandidates([]);
            setPreviewPostId(null);
            setError("");
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setCandidates([]);
        setPreviewPostId(null);
        setError("");

        const loadCandidates = async () => {
            try {
                const response = await fetch(
                    `/api/posts/shift-candidates?date=${encodeURIComponent(target.date)}&shift=${encodeURIComponent(target.slot)}`,
                    { signal: controller.signal },
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = (await response.json()) as ShiftPostCandidate[];
                setCandidates(data);
            } catch (fetchError) {
                if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
                    return;
                }
                console.error("Error loading shift post candidates:", fetchError);
                setError("候補ポストの読み込みに失敗しました");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCandidates();
        return () => controller.abort();
    }, [target]);

    return (
        <Dialog
            open={target !== null}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            data-testid="shift-candidate-dialog"
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                    {target
                        ? `${target.date} (${target.dayOfWeek}) ${SHIFT_LABELS[target.slot]}の情報源`
                        : "シフト情報源"}
                </Box>
                <IconButton onClick={onClose} size="small" aria-label="閉じる">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        同じ日に登録された未使用のギャラリーポストを、近い時間帯から表示しています。
                    </Typography>

                    {isLoading ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={20} />
                            <Typography variant="body2">候補を探しています...</Typography>
                        </Stack>
                    ) : null}
                    {error ? <Alert severity="error">{error}</Alert> : null}
                    {!isLoading && !error && candidates.length === 0 ? (
                        <Alert severity="info">
                            この日に利用できる既存ポストは見つかりませんでした。
                        </Alert>
                    ) : null}

                    {candidates.map((candidate) => (
                        <Paper
                            key={candidate.id}
                            variant="outlined"
                            sx={{ p: 2 }}
                            data-testid={`shift-candidate-${candidate.id}`}
                        >
                            <Stack spacing={1.5}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    justifyContent="space-between"
                                >
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        <Chip
                                            label={`${formatPostedAt(candidate.postedAt)}投稿`}
                                            size="small"
                                        />
                                        <Chip
                                            label={SHIFT_LABELS[candidate.inferredShift]}
                                            color={
                                                candidate.inferredShift === target?.slot
                                                    ? "success"
                                                    : "default"
                                            }
                                            variant={
                                                candidate.inferredShift === target?.slot
                                                    ? "filled"
                                                    : "outlined"
                                            }
                                            size="small"
                                        />
                                        <Chip
                                            label={formatDifference(candidate.differenceMinutes)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Stack>
                                    <Link
                                        href={`https://x.com/i/status/${candidate.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                                    >
                                        {candidate.id}
                                        <OpenInNewIcon fontSize="inherit" />
                                    </Link>
                                </Stack>

                                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                    {candidate.taggedCasts.length > 0 ? (
                                        candidate.taggedCasts.map((cast) => (
                                            <Chip
                                                key={cast.id}
                                                label={`${cast.order}. ${cast.name}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            キャストタグなし
                                        </Typography>
                                    )}
                                </Stack>

                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Button
                                        size="small"
                                        variant={
                                            previewPostId === candidate.id
                                                ? "contained"
                                                : "outlined"
                                        }
                                        onClick={() =>
                                            setPreviewPostId((current) =>
                                                current === candidate.id ? null : candidate.id,
                                            )
                                        }
                                        data-testid={`shift-candidate-preview-${candidate.id}`}
                                    >
                                        {previewPostId === candidate.id
                                            ? "内容を閉じる"
                                            : "内容を確認"}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => onSelect(candidate.id)}
                                        data-testid={`shift-candidate-select-${candidate.id}`}
                                    >
                                        このポストを使う
                                    </Button>
                                </Stack>

                                {previewPostId === candidate.id ? (
                                    <Box data-testid={`shift-candidate-tweet-${candidate.id}`}>
                                        <Tweet id={candidate.id} taggedCasts={candidate.taggedCasts} />
                                    </Box>
                                ) : null}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, flexWrap: "wrap" }}>
                <Button onClick={onClose} color="inherit">
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onSelect(null)}
                    data-testid="shift-candidate-create-new"
                >
                    新しいポストを登録
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShiftPostCandidateDialog;
