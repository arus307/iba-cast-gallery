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
import { ShiftSlot, ShiftGroup } from "@iba-cast-gallery/types";
import { Tweet } from "../../components/tweet/swr";
import dayjs from "dayjs";

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
    onFillMissing: (date: string, slot: ShiftSlot) => void;
}) => {
    const [groups, setGroups] = useState<ShiftGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewGroup, setPreviewGroup] = useState<ShiftGroup | null>(null);
    const [coverageFrom, setCoverageFrom] = useState(
        dayjs().subtract(13, "day").format("YYYY-MM-DD"),
    );
    const [coverageTo, setCoverageTo] = useState(dayjs().format("YYYY-MM-DD"));

    // ソース追加ダイアログ用の状態
    const [addSourceTarget, setAddSourceTarget] = useState<ShiftGroup | null>(null);
    const [sourceInput, setSourceInput] = useState("");
    const [sourceTweetId, setSourceTweetId] = useState("");
    const [savingSource, setSavingSource] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/shifts/list")
            .then((r) => r.json())
            .then((data: ShiftGroup[]) => setGroups(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
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

    const missingShiftDays = useMemo(() => {
        if (coverageError) {
            return [];
        }

        const registeredSlots = new Set(
            groups.map((group) => `${group.date}__${group.shift}`),
        );
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
                    (slot) => !registeredSlots.has(`${date}__${slot}`),
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
    }, [coverageError, coverageFrom, coverageTo, groups]);

    const missingSlotCount = missingShiftDays.reduce(
        (count, day) => count + day.slots.length,
        0,
    );

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
                                label={coverageError ? "期間を確認" : `${missingSlotCount}枠 未登録`}
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
                        <Alert severity="success">この期間は3枠すべて登録済みです</Alert>
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
                                                onClick={() => onFillMissing(day.date, slot)}
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
