"use client";

import { useState, useEffect } from "react";
import {
    Alert,
    Button,
    Chip,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Cast } from "@iba-cast-gallery/dao";
import { CastType, EventType, EventDto } from "@iba-cast-gallery/types";
import { Tweet } from "../../components/tweet/swr";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
    [EventType.CAST_EVENT]: "キャストイベント",
    [EventType.KAMITSUBAKI]: "カミツバキ",
    [EventType.COLLAB]: "コラボ",
};

const EventEditor = ({ onSaved, editTarget, onCancelEdit }: {
    onSaved?: () => void;
    editTarget?: EventDto | null;
    onCancelEdit?: () => void;
}) => {
    const [casts, setCasts] = useState<Cast[]>([]);
    const [eventType, setEventType] = useState<EventType>(EventType.CAST_EVENT);
    const [title, setTitle] = useState("");
    const [dateStart, setDateStart] = useState<Dayjs>(dayjs());
    const [dateEnd, setDateEnd] = useState<Dayjs>(dayjs());
    const [timeNote, setTimeNote] = useState("");
    const [notes, setNotes] = useState("");
    const [tweetInput, setTweetInput] = useState("");
    const [tweetId, setTweetId] = useState("");
    const [selectedCastIds, setSelectedCastIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success",
    });

    const isEditing = !!editTarget;

    // キャスト一覧取得
    useEffect(() => {
        fetch("/api/casts")
            .then((r) => r.json())
            .then(setCasts)
            .catch(console.error);
    }, []);

    // 編集対象が変わったらフォームに反映
    useEffect(() => {
        if (editTarget) {
            setEventType(editTarget.eventType);
            setTitle(editTarget.title);
            setDateStart(dayjs(editTarget.dateStart));
            setDateEnd(dayjs(editTarget.dateEnd));
            setTimeNote(editTarget.timeNote ?? "");
            setNotes(editTarget.notes ?? "");
            setTweetInput(editTarget.sourcePostId ?? "");
            setSelectedCastIds(editTarget.casts.map((c) => c.id));
        } else {
            resetForm();
        }
    }, [editTarget]);

    // ツイートURL → ID 変換
    useEffect(() => {
        const match = tweetInput.match(/\/status\/(\d+)/);
        if (match) setTweetId(match[1]);
        else if (/^\d+$/.test(tweetInput)) setTweetId(tweetInput);
        else setTweetId("");
    }, [tweetInput]);

    const resetForm = () => {
        setEventType(EventType.CAST_EVENT);
        setTitle("");
        setDateStart(dayjs());
        setDateEnd(dayjs());
        setTimeNote("");
        setNotes("");
        setTweetInput("");
        setTweetId("");
        setSelectedCastIds([]);
    };

    const toggleCast = (id: number) => {
        setSelectedCastIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const save = async () => {
        if (!dateStart?.isValid() || !dateEnd?.isValid() || !title.trim()) return;
        setSaving(true);
        try {
            const body = {
                eventType,
                title: title.trim(),
                dateStart: dateStart.format("YYYY-MM-DD"),
                dateEnd: dateEnd.format("YYYY-MM-DD"),
                timeNote: timeNote.trim() || null,
                notes: notes.trim() || null,
                sourcePostId: tweetId || null,
                castIds: selectedCastIds,
            };

            const url = isEditing ? `/api/events/${editTarget!.id}` : "/api/events";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            setSnackbar({ open: true, message: isEditing ? "更新しました！" : "登録しました！", severity: "success" });
            if (!isEditing) resetForm();
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
            {isEditing && (
                <Typography variant="body2" color="primary">
                    編集中: {editTarget!.title}
                </Typography>
            )}

            {/* イベント種別 */}
            <FormControl fullWidth size="small">
                <InputLabel>イベント種別</InputLabel>
                <Select
                    value={eventType}
                    label="イベント種別"
                    onChange={(e) => setEventType(e.target.value as EventType)}
                >
                    {Object.values(EventType).map((t) => (
                        <MenuItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* タイトル */}
            <TextField
                fullWidth
                label="イベント名"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
                placeholder="〇〇生誕祭"
                inputProps={{ "data-testid": "event-title-input" }}
            />

            {/* 日付 */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={2}>
                    <DateField
                        label="開始日"
                        format="YYYY/MM/DD"
                        value={dateStart}
                        onChange={(v) => {
                            if (v) {
                                setDateStart(v);
                                if (v.isAfter(dateEnd)) setDateEnd(v);
                            }
                        }}
                        fullWidth
                        size="small"
                        slotProps={{ textField: { inputProps: { "data-testid": "event-date-start-input" } } }}
                    />
                    <DateField
                        label="終了日"
                        format="YYYY/MM/DD"
                        value={dateEnd}
                        onChange={(v) => v && setDateEnd(v)}
                        fullWidth
                        size="small"
                        slotProps={{ textField: { inputProps: { "data-testid": "event-date-end-input" } } }}
                    />
                </Stack>
            </LocalizationProvider>

            {/* 時間帯メモ */}
            <TextField
                fullWidth
                label="時間帯（任意）"
                value={timeNote}
                onChange={(e) => setTimeNote(e.target.value)}
                size="small"
                placeholder="14:00〜、終日 など"
                inputProps={{ "data-testid": "event-time-note-input" }}
            />

            {/* ソースツイート */}
            <TextField
                fullWidth
                label="ソースツイート URL または ID（任意）"
                value={tweetInput}
                onChange={(e) => setTweetInput(e.target.value)}
                size="small"
                placeholder="https://x.com/.../status/..."
                inputProps={{ "data-testid": "event-tweet-url-input" }}
            />
            {tweetId && <Tweet id={tweetId} taggedCasts={[]} />}

            {/* メモ */}
            <TextField
                fullWidth
                label="メモ（任意）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                multiline
                rows={2}
                inputProps={{ "data-testid": "event-notes-input" }}
            />

            {/* RC キャスト */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    出演キャスト — リアルキャスト (RC)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {rcCasts.map((c) => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            onClick={() => toggleCast(c.id)}
                            color={selectedCastIds.includes(c.id) ? "primary" : "default"}
                            variant={selectedCastIds.includes(c.id) ? "filled" : "outlined"}
                            clickable
                        />
                    ))}
                </Stack>
            </Stack>

            <Divider />

            {/* IC キャスト */}
            <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                    出演キャスト — イマジナリーキャスト (IC)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {icCasts.map((c) => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            onClick={() => toggleCast(c.id)}
                            color={selectedCastIds.includes(c.id) ? "primary" : "default"}
                            variant={selectedCastIds.includes(c.id) ? "filled" : "outlined"}
                            clickable
                        />
                    ))}
                </Stack>
            </Stack>

            {selectedCastIds.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                    選択中 ({selectedCastIds.length}名):{" "}
                    {casts.filter((c) => selectedCastIds.includes(c.id)).map((c) => c.name).join(", ")}
                </Typography>
            )}

            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    onClick={save}
                    disabled={saving || !dateStart?.isValid() || !dateEnd?.isValid() || !title.trim()}
                    data-testid="event-save-button"
                >
                    {saving ? "保存中..." : isEditing ? "更新する" : "登録する"}
                </Button>
                {isEditing && (
                    <Button variant="outlined" onClick={onCancelEdit} data-testid="event-cancel-button">
                        キャンセル
                    </Button>
                )}
            </Stack>

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

export default EventEditor;
