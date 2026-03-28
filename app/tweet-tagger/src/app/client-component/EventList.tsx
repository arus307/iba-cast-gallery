"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { EventDto, EventType } from "@iba-cast-gallery/types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
    [EventType.CAST_EVENT]: "キャストイベント",
    [EventType.KAMITSUBAKI]: "カミツバキ",
    [EventType.COLLAB]: "コラボ",
};

const EventList = ({ refreshKey, onEdit }: { refreshKey: number; onEdit?: (event: EventDto) => void }) => {
    const [events, setEvents] = useState<EventDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success",
    });

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/events")
            .then((r) => r.json())
            .then((data: EventDto[]) => setEvents(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [refreshKey]);

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`「${title}」を削除しますか？`)) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setEvents((prev) => prev.filter((e) => e.id !== id));
            setSnackbar({ open: true, message: "削除しました", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "削除に失敗しました", severity: "error" });
        }
    };

    if (isLoading) return <CircularProgress size={24} />;

    if (events.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                登録済みイベントはありません
            </Typography>
        );
    }

    return (
        <>
            <TableContainer component={Paper} data-testid="event-list">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>種別</TableCell>
                            <TableCell>イベント名</TableCell>
                            <TableCell>期間</TableCell>
                            <TableCell>時間帯</TableCell>
                            <TableCell>出演キャスト</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((ev) => (
                            <TableRow key={ev.id} data-testid={`event-list-row-${ev.id}`}>
                                <TableCell>
                                    <Chip
                                        label={EVENT_TYPE_LABELS[ev.eventType]}
                                        size="small"
                                        color={ev.eventType === EventType.CAST_EVENT ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{ev.title}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    {ev.dateStart === ev.dateEnd
                                        ? ev.dateStart
                                        : `${ev.dateStart} 〜 ${ev.dateEnd}`}
                                </TableCell>
                                <TableCell>{ev.timeNote ?? "—"}</TableCell>
                                <TableCell>
                                    {ev.casts.length > 0
                                        ? ev.casts.map((c) => c.name).join("、")
                                        : <Typography variant="caption" color="text.secondary">なし</Typography>}
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" onClick={() => onEdit?.(ev)}>編集</Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(ev.id, ev.title)}>削除</Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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

export default EventList;
