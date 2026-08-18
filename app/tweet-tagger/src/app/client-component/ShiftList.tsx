"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Paper,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { ShiftSlot } from "@iba-cast-gallery/types";
import type {
    ShiftGroup,
    ShiftNoPostConfirmationDto,
} from "@iba-cast-gallery/types";
import { Tweet } from "../../components/tweet/swr";
import dayjs from "dayjs";
import ShiftPostCandidateDialog, {
    type MissingShiftTarget,
} from "app/client-component/ShiftPostCandidateDialog";

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const EXPECTED_SHIFT_SLOTS = [
    ShiftSlot.OPEN,
    ShiftSlot.EVENING,
    ShiftSlot.NIGHT,
];
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const MAX_COVERAGE_DAYS = 366;

const ShiftList = ({
    refreshKey,
    onFillMissing,
}: {
    refreshKey: number;
    onFillMissing: (
        date: string,
        slot: ShiftSlot,
        sourcePostId: string | null,
    ) => void;
}) => {
    const [groups, setGroups] = useState<ShiftGroup[]>([]);
    const [noPostConfirmations, setNoPostConfirmations] = useState<
        ShiftNoPostConfirmationDto[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewGroup, setPreviewGroup] = useState<ShiftGroup | null>(null);
    const [missingShiftTarget, setMissingShiftTarget] =
        useState<MissingShiftTarget | null>(null);
    const [coverageFrom, setCoverageFrom] = useState(
        dayjs().subtract(13, "day").format("YYYY-MM-DD"),
    );
    const [coverageTo, setCoverageTo] = useState(dayjs().format("YYYY-MM-DD"));

    // ソース追加ダイアログ用の状態
    const [addSourceTarget, setAddSourceTarget] = useState<ShiftGroup | null>(null);
    const [sourceInput, setSourceInput] = useState("");
    const [sourceTweetId, setSourceTweetId] = useState("");
    const [savingSource, setSavingSource] = useState(false);
    const [isConfirmingNoPost, setIsConfirmingNoPost] = useState(false);
    const [restoringNoPostKey, setRestoringNoPostKey] = useState("");
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        Promise.all([
            fetch("/api/shifts/list", { signal: controller.signal }),
            fetch("/api/shifts/no-post", { signal: controller.signal }),
        ])
            .then(async ([shiftResponse, noPostResponse]) => {
                if (!shiftResponse.ok || !noPostResponse.ok) {
                    throw new Error("シフト確認データの取得に失敗しました");
                }
                const [shiftGroups, confirmations] = await Promise.all([
                    shiftResponse.json() as Promise<ShiftGroup[]>,
                    noPostResponse.json() as Promise<
                        ShiftNoPostConfirmationDto[]
                    >,
                ]);
                setGroups(shiftGroups);
                setNoPostConfirmations(confirmations);
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error(error);
                setSnackbar({
                    open: true,
                    message: "シフト確認データの読み込みに失敗しました",
                    severity: "error",
                });
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });
        return () => controller.abort();
    }, [refreshKey]);

    const coverageError = useMemo(() => {
        const from = dayjs(coverageFrom);
        const to = dayjs(coverageTo);
        if (!from.isValid() || !to.isValid()) {
            return "確認期間を入力してください";
        }
        if (from.isAfter(to, "day")) {
            return "開始日は終了日以前にしてください";
        }
        if (to.diff(from, "day") >= MAX_COVERAGE_DAYS) {
            return `確認期間は${MAX_COVERAGE_DAYS}日以内にしてください`;
        }
        return null;
    }, [coverageFrom, coverageTo]);

    const registeredSlotKeys = useMemo(
        () => new Set(groups.map((group) => `${group.date}__${group.shift}`)),
        [groups],
    );
    const noPostSlotKeys = useMemo(
        () =>
            new Set(
                noPostConfirmations.map(
                    (confirmation) =>
                        `${confirmation.date}__${confirmation.shift}`,
                ),
            ),
        [noPostConfirmations],
    );

    const missingShiftDays = useMemo(() => {
        if (coverageError) {
            return [];
        }

        const missing: {
            date: string;
            dayOfWeek: string;
            slots: ShiftSlot[];
        }[] = [];

        let targetDate = dayjs(coverageFrom).startOf("day");
        const endDate = dayjs(coverageTo).startOf("day");
        while (!targetDate.isAfter(endDate, "day")) {
            // 水曜（day() === 3）は定休日として登録対象から除外する。
            if (targetDate.day() !== 3) {
                const date = targetDate.format("YYYY-MM-DD");
                const slots = EXPECTED_SHIFT_SLOTS.filter(
                    (slot) =>
                        !registeredSlotKeys.has(`${date}__${slot}`) &&
                        !noPostSlotKeys.has(`${date}__${slot}`),
                );
                if (slots.length > 0) {
                    missing.push({
                        date,
                        dayOfWeek: DAY_LABELS[targetDate.day()],
                        slots,
                    });
                }
            }
            targetDate = targetDate.add(1, "day");
        }

        return missing.toReversed();
    }, [
        coverageError,
        coverageFrom,
        coverageTo,
        noPostSlotKeys,
        registeredSlotKeys,
    ]);

    const confirmedNoPostInRange = useMemo(() => {
        if (coverageError) {
            return [];
        }

        return noPostConfirmations
            .filter(
                (confirmation) =>
                    confirmation.date >= coverageFrom &&
                    confirmation.date <= coverageTo &&
                    !registeredSlotKeys.has(
                        `${confirmation.date}__${confirmation.shift}`,
                    ),
            )
            .toSorted((a, b) => {
                const dateComparison = b.date.localeCompare(a.date);
                return dateComparison !== 0
                    ? dateComparison
                    : a.shift.localeCompare(b.shift);
            });
    }, [
        coverageError,
        coverageFrom,
        coverageTo,
        noPostConfirmations,
        registeredSlotKeys,
    ]);

    const missingSlotCount = missingShiftDays.reduce(
        (count, day) => count + day.slots.length,
        0,
    );

    const selectMissingShiftSource = (sourcePostId: string | null) => {
        if (!missingShiftTarget) {
            return;
        }
        onFillMissing(
            missingShiftTarget.date,
            missingShiftTarget.slot,
            sourcePostId,
        );
        setMissingShiftTarget(null);
    };

    const confirmMissingShiftHasNoPost = async () => {
        if (!missingShiftTarget || isConfirmingNoPost) {
            return;
        }

        setIsConfirmingNoPost(true);
        try {
            const response = await fetch("/api/shifts/no-post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: missingShiftTarget.date,
                    shift: missingShiftTarget.slot,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const confirmation =
                (await response.json()) as ShiftNoPostConfirmationDto;
            setNoPostConfirmations((current) => [
                ...current.filter(
                    (item) =>
                        item.date !== confirmation.date ||
                        item.shift !== confirmation.shift,
                ),
                confirmation,
            ]);
            setMissingShiftTarget(null);
            setSnackbar({
                open: true,
                message: "情報ポストなしとして確認済みにしました",
                severity: "success",
            });
        } catch (error) {
            console.error("Error confirming no shift post:", error);
            setSnackbar({
                open: true,
                message: "情報ポストなしの確認保存に失敗しました",
                severity: "error",
            });
        } finally {
            setIsConfirmingNoPost(false);
        }
    };

    const restoreMissingShift = async (
        confirmation: ShiftNoPostConfirmationDto,
    ) => {
        const key = `${confirmation.date}__${confirmation.shift}`;
        if (restoringNoPostKey) {
            return;
        }

        setRestoringNoPostKey(key);
        try {
            const response = await fetch(
                `/api/shifts/no-post?date=${encodeURIComponent(confirmation.date)}&shift=${encodeURIComponent(confirmation.shift)}`,
                { method: "DELETE" },
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            setNoPostConfirmations((current) =>
                current.filter(
                    (item) =>
                        item.date !== confirmation.date ||
                        item.shift !== confirmation.shift,
                ),
            );
            setSnackbar({
                open: true,
                message: "入力漏れチェックへ戻しました",
                severity: "success",
            });
        } catch (error) {
            console.error("Error restoring missing shift:", error);
            setSnackbar({
                open: true,
                message: "入力漏れチェックへの復元に失敗しました",
                severity: "error",
            });
        } finally {
            setRestoringNoPostKey("");
        }
    };

    // ツイートURL → ID 変換
    useEffect(() => {
        const match = sourceInput.match(/\/status\/(\d+)/);
        if (match) setSourceTweetId(match[1]);
        else if (/^\d+$/.test(sourceInput)) setSourceTweetId(sourceInput);
        else setSourceTweetId("");
    }, [sourceInput]);

    const openAddSource = (group: ShiftGroup) => {
        setAddSourceTarget(group);
        setSourceInput("");
        setSourceTweetId("");
    };

    const closeAddSource = () => {
        setAddSourceTarget(null);
        setSourceInput("");
        setSourceTweetId("");
    };

    const saveSource = async () => {
        if (!addSourceTarget || !sourceTweetId) return;
        setSavingSource(true);
        try {
            const res = await fetch("/api/shifts/source", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...addSourceTarget, sourcePostId: sourceTweetId }),
            });
            if (!res.ok) throw new Error();
            setGroups((prev) =>
                prev.map((g) =>
                    g.date === addSourceTarget.date && g.shift === addSourceTarget.shift
                        ? { ...g, sourcePostId: sourceTweetId }
                        : g
                )
            );
            setSnackbar({ open: true, message: "ソースを保存しました！", severity: "success" });
            closeAddSource();
        } catch {
            setSnackbar({ open: true, message: "保存に失敗しました", severity: "error" });
        } finally {
            setSavingSource(false);
        }
    };

    if (isLoading) {
        return <CircularProgress size={24} />;
    }

    return (
        <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2 }} data-testid="shift-coverage-panel">
                <Stack spacing={2}>
                    <Box>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                シフト入力漏れチェック
                            </Typography>
                            <Chip
                                label={coverageError ? "期間を確認" : `${missingSlotCount}枠 未確認`}
                                color={coverageError ? "error" : missingSlotCount > 0 ? "warning" : "success"}
                                size="small"
                            />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            水曜を定休日として除外し、各日のオープン・夕方・夜を確認します。
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            label="開始日"
                            type="date"
                            size="small"
                            value={coverageFrom}
                            onChange={(event) => setCoverageFrom(event.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { "data-testid": "shift-coverage-from" },
                            }}
                        />
                        <TextField
                            label="終了日"
                            type="date"
                            size="small"
                            value={coverageTo}
                            onChange={(event) => setCoverageTo(event.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { "data-testid": "shift-coverage-to" },
                            }}
                        />
                    </Stack>

                    {coverageError ? <Alert severity="error">{coverageError}</Alert> : null}
                    {!coverageError && missingShiftDays.length === 0 ? (
                        <Alert severity="success">
                            この期間はすべて登録済み、または情報ポストなしとして確認済みです
                        </Alert>
                    ) : null}
                    {!coverageError && missingShiftDays.length > 0 ? (
                        <Stack
                            spacing={1}
                            sx={{ maxHeight: 360, overflowY: "auto", pr: 0.5 }}
                            data-testid="shift-missing-list"
                        >
                            {missingShiftDays.map((day) => (
                                <Stack
                                    key={day.date}
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    alignItems={{ xs: "stretch", sm: "center" }}
                                    justifyContent="space-between"
                                    sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}
                                >
                                    <Typography variant="body2" sx={{ minWidth: 130 }}>
                                        {`${day.date} (${day.dayOfWeek})`}
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {day.slots.map((slot) => (
                                            <Button
                                                key={slot}
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                onClick={() =>
                                                    setMissingShiftTarget({
                                                        date: day.date,
                                                        dayOfWeek: day.dayOfWeek,
                                                        slot,
                                                    })
                                                }
                                                data-testid={`shift-missing-${day.date}-${slot}`}
                                            >
                                                {`${SHIFT_LABELS[slot]}を入力`}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    ) : null}

                    {!coverageError && confirmedNoPostInRange.length > 0 ? (
                        <Box
                            sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}
                            data-testid="shift-no-post-confirmed-list"
                        >
                            <Stack spacing={1.25}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        情報ポストなし（確認済み）
                                    </Typography>
                                    <Chip
                                        label={`${confirmedNoPostInRange.length}枠`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    誤って消し込んだ場合は、未確認の枠へ戻せます。
                                </Typography>
                                {confirmedNoPostInRange.map((confirmation) => {
                                    const key = `${confirmation.date}__${confirmation.shift}`;
                                    return (
                                        <Stack
                                            key={key}
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={1}
                                            alignItems={{ xs: "stretch", sm: "center" }}
                                            justifyContent="space-between"
                                            data-testid={`shift-no-post-confirmed-${confirmation.date}-${confirmation.shift}`}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Typography variant="body2">
                                                    {`${confirmation.date} (${DAY_LABELS[dayjs(confirmation.date).day()]})`}
                                                </Typography>
                                                <Chip
                                                    label={SHIFT_LABELS[confirmation.shift]}
                                                    size="small"
                                                />
                                            </Stack>
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() =>
                                                    void restoreMissingShift(confirmation)
                                                }
                                                disabled={Boolean(restoringNoPostKey)}
                                                loading={restoringNoPostKey === key}
                                                loadingPosition="start"
                                                data-testid={`shift-no-post-restore-${confirmation.date}-${confirmation.shift}`}
                                            >
                                                {restoringNoPostKey === key
                                                    ? "復元中..."
                                                    : "未確認に戻す"}
                                            </Button>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Box>
                    ) : null}
                </Stack>
            </Paper>

            {groups.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    登録済みシフトはありません
                </Typography>
            ) : (
                <TableContainer component={Paper} data-testid="shift-list">
                    <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>日付</TableCell>
                            <TableCell>曜日</TableCell>
                            <TableCell>シフト</TableCell>
                            <TableCell>キャスト</TableCell>
                            <TableCell>ソース</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map((g) => (
                            <TableRow key={`${g.date}-${g.shift}`} data-testid={`shift-list-row-${g.date}-${g.shift}-${g.casts.map((c) => c.id).join('-')}`}>
                                <TableCell>{g.date}</TableCell>
                                <TableCell>{g.dayOfWeek}</TableCell>
                                <TableCell>{SHIFT_LABELS[g.shift]}</TableCell>
                                <TableCell>{g.casts.map((c) => c.name).join("、")}</TableCell>
                                <TableCell>
                                    {g.sourcePostId ? (
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={() => setPreviewGroup(g)}
                                            data-testid={`shift-source-link-${g.date}-${g.shift}`}
                                        >
                                            ツイートを確認
                                        </Link>
                                    ) : (
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={() => openAddSource(g)}
                                            data-testid={`shift-add-source-${g.date}-${g.shift}`}
                                        >
                                            追加
                                        </Link>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            )}

            <ShiftPostCandidateDialog
                target={missingShiftTarget}
                onClose={() => setMissingShiftTarget(null)}
                onSelect={selectMissingShiftSource}
                onConfirmNoPost={() => void confirmMissingShiftHasNoPost()}
                isConfirmingNoPost={isConfirmingNoPost}
            />

            {/* ソースプレビューダイアログ */}
            <Dialog
                open={previewGroup !== null}
                onClose={() => setPreviewGroup(null)}
                maxWidth="sm"
                fullWidth
                data-testid="shift-source-dialog"
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    シフト情報源ツイート
                    <IconButton onClick={() => setPreviewGroup(null)} size="small" aria-label="閉じる">
                        ✕
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {previewGroup && (
                        <>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                                data-testid="shift-source-dialog-shift-info"
                            >
                                {`${previewGroup.date} (${previewGroup.dayOfWeek}) ${SHIFT_LABELS[previewGroup.shift]} — ${previewGroup.casts.map((c) => c.name).join("、")}`}
                            </Typography>
                            {previewGroup.sourcePostId && <Tweet id={previewGroup.sourcePostId} taggedCasts={[]} />}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ソース追加ダイアログ */}
            <Dialog
                open={addSourceTarget !== null}
                onClose={closeAddSource}
                maxWidth="sm"
                fullWidth
                data-testid="shift-add-source-dialog"
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {addSourceTarget && `${addSourceTarget.date} ${SHIFT_LABELS[addSourceTarget.shift]} のソースを追加`}
                    <IconButton onClick={closeAddSource} size="small" aria-label="閉じる">
                        ✕
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {addSourceTarget && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                data-testid="shift-add-source-dialog-shift-info"
                            >
                                {`${addSourceTarget.date} (${addSourceTarget.dayOfWeek}) ${SHIFT_LABELS[addSourceTarget.shift]} — ${addSourceTarget.casts.map((c) => c.name).join("、")}`}
                            </Typography>
                        )}
                        <TextField
                            fullWidth
                            label="ツイートURL または ID"
                            value={sourceInput}
                            onChange={(e) => setSourceInput(e.target.value)}
                            size="small"
                            placeholder="https://x.com/.../status/..."
                            inputProps={{ "data-testid": "add-source-tweet-input" }}
                        />
                        {sourceTweetId && <Tweet id={sourceTweetId} taggedCasts={[]} />}
                        <Button
                            variant="contained"
                            onClick={saveSource}
                            disabled={savingSource || !sourceTweetId}
                            loading={savingSource}
                            loadingPosition="start"
                            data-testid="add-source-save-button"
                        >
                            {savingSource ? "保存中..." : "保存する"}
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};

export default ShiftList;
