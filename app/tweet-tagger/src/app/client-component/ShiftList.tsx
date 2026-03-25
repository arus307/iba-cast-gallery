"use client";

import { useEffect, useState } from "react";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/shifts/list")
            .then((r) => r.json())
            .then((data: ShiftGroup[]) => setGroups(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [refreshKey]);

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
                                        <Typography variant="body2" color="text.disabled">—</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
        </>
    );
};

export default ShiftList;
