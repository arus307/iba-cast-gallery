"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Button,
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

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const ShiftList = ({ refreshKey }: { refreshKey: number }) => {
    const [groups, setGroups] = useState<ShiftGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewTweetId, setPreviewTweetId] = useState<string | null>(null);

    // ソース追加ダイアログ用の状態
    const [addSourceTarget, setAddSourceTarget] = useState<{ date: string; shift: ShiftSlot } | null>(null);
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

    // ツイートURL → ID 変換
    useEffect(() => {
        const match = sourceInput.match(/\/status\/(\d+)/);
        if (match) setSourceTweetId(match[1]);
        else if (/^\d+$/.test(sourceInput)) setSourceTweetId(sourceInput);
        else setSourceTweetId("");
    }, [sourceInput]);

    const openAddSource = (date: string, shift: ShiftSlot) => {
        setAddSourceTarget({ date, shift });
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

    if (groups.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                登録済みシフトはありません
            </Typography>
        );
    }

    return (
        <>
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
                        {groups.map((g, i) => (
                            <TableRow key={`${g.date}-${g.shift}`} data-testid={`shift-list-row-${i + 1}`}>
                                <TableCell>{g.date}</TableCell>
                                <TableCell>{g.dayOfWeek}</TableCell>
                                <TableCell>{SHIFT_LABELS[g.shift]}</TableCell>
                                <TableCell>{g.casts.map((c) => c.name).join("、")}</TableCell>
                                <TableCell>
                                    {g.sourcePostId ? (
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={() => setPreviewTweetId(g.sourcePostId)}
                                            data-testid={`shift-source-link-${i + 1}`}
                                        >
                                            ツイートを確認
                                        </Link>
                                    ) : (
                                        <Link
                                            component="button"
                                            variant="body2"
                                            onClick={() => openAddSource(g.date, g.shift)}
                                            data-testid={`shift-add-source-${i + 1}`}
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

            {/* ソースプレビューダイアログ */}
            <Dialog
                open={previewTweetId !== null}
                onClose={() => setPreviewTweetId(null)}
                maxWidth="sm"
                fullWidth
                data-testid="shift-source-dialog"
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    シフト情報源ツイート
                    <IconButton onClick={() => setPreviewTweetId(null)} size="small" aria-label="閉じる">
                        ✕
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {previewTweetId && (
                        <Tweet id={previewTweetId} taggedCasts={[]} />
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
        </>
    );
};

export default ShiftList;
