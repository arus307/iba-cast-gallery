"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Alert,
    Button,
    Chip,
    Divider,
    Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Cast } from "@iba-cast-gallery/dao";
import { CastType, ShiftSlot } from "@iba-cast-gallery/types";
import { Tweet } from "../../components/tweet/swr";

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const ShiftEditor = ({ onSaved }: { onSaved?: () => void }) => {
    const [casts, setCasts] = useState<Cast[]>([]);
    const [tweetInput, setTweetInput] = useState("");
    const [tweetId, setTweetId] = useState("");
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [slot, setSlot] = useState<ShiftSlot>(ShiftSlot.NIGHT);
    const [selectedCastIds, setSelectedCastIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    // キャスト一覧取得
    useEffect(() => {
        fetch("/api/casts")
            .then((r) => r.json())
            .then(setCasts)
            .catch(console.error);
    }, []);

    // ツイートURL → ID 変換
    useEffect(() => {
        const match = tweetInput.match(/\/status\/(\d+)/);
        if (match) {
            setTweetId(match[1]);
        } else if (/^\d+$/.test(tweetInput)) {
            setTweetId(tweetInput);
        } else {
            setTweetId("");
        }
    }, [tweetInput]);

    // 日付・シフト変更時に既存記録を取得して反映
    const fetchExisting = useCallback(async () => {
        if (!date?.isValid()) return;
        const dateStr = date.format("YYYY-MM-DD");
        try {
            const res = await fetch(`/api/shifts?date=${dateStr}&shift=${slot}`);
            if (!res.ok) return;
            const data: { castIds: number[]; sourcePostId: string | null } = await res.json();
            setSelectedCastIds(new Set(data.castIds));
            if (data.sourcePostId) {
                setTweetInput(data.sourcePostId);
            } else {
                setTweetInput("");
            }
        } catch (e) {
            console.error(e);
        }
    }, [date, slot]);

    useEffect(() => {
        fetchExisting();
    }, [fetchExisting]);

    const toggleCast = (id: number) => {
        setSelectedCastIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const save = async () => {
        if (!date?.isValid()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: date.format("YYYY-MM-DD"),
                    shift: slot,
                    castIds: [...selectedCastIds],
                    sourcePostId: tweetId || null,
                }),
            });
            if (!res.ok) throw new Error();
            setSnackbar({ open: true, message: "保存しました！", severity: "success" });
            onSaved?.();
        } catch {
            setSnackbar({ open: true, message: "保存に失敗しました", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const rcCasts = casts.filter((c) => c.type === CastType.REAL && c.isActive);
    const icCasts = casts.filter((c) => c.type === CastType.IMAGINARY && c.isActive);

    return (
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 600 }}>
            {/* ツイートURL入力 */}
            <TextField
                fullWidth
                label="ツイートURL または ID"
                value={tweetInput}
                onChange={(e) => setTweetInput(e.target.value)}
                size="small"
                placeholder="https://x.com/.../status/..."
                inputProps={{ "data-testid": "shift-tweet-url-input" }}
            />
            {tweetId && <Tweet id={tweetId} taggedCasts={[]} />}

            {/* 日付 */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                    label="日付"
                    format="YYYY/MM/DD"
                    value={date}
                    onChange={(v) => v && setDate(v)}
                    fullWidth
                    size="small"
                    slotProps={{ textField: { inputProps: { "data-testid": "shift-date-input" } } }}
                />
            </LocalizationProvider>

            {/* シフト */}
            <ToggleButtonGroup
                value={slot}
                exclusive
                onChange={(_, v) => v && setSlot(v)}
                fullWidth
                size="small"
            >
                {Object.values(ShiftSlot).map((s) => (
                    <ToggleButton key={s} value={s}>
                        {SHIFT_LABELS[s]}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {/* RC キャスト */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    リアルキャスト (RC)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {rcCasts.map((c) => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            onClick={() => toggleCast(c.id)}
                            color={selectedCastIds.has(c.id) ? "primary" : "default"}
                            variant={selectedCastIds.has(c.id) ? "filled" : "outlined"}
                            clickable
                        />
                    ))}
                </Stack>
            </Stack>

            <Divider />

            {/* IC キャスト */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    イマジナリーキャスト (IC)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {icCasts.map((c) => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            onClick={() => toggleCast(c.id)}
                            color={selectedCastIds.has(c.id) ? "primary" : "default"}
                            variant={selectedCastIds.has(c.id) ? "filled" : "outlined"}
                            clickable
                        />
                    ))}
                </Stack>
            </Stack>

            {/* 選択中サマリー */}
            {selectedCastIds.size > 0 && (
                <Typography variant="caption" color="text.secondary">
                    選択中 ({selectedCastIds.size}名):{" "}
                    {casts
                        .filter((c) => selectedCastIds.has(c.id))
                        .map((c) => c.name)
                        .join(", ")}
                </Typography>
            )}

            <Button
                variant="contained"
                onClick={save}
                disabled={saving || !date?.isValid()}
                loading={saving}
                loadingPosition="start"
                data-testid="shift-save-button"
            >
                {saving ? "保存中..." : "保存する"}
            </Button>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};

export default ShiftEditor;
