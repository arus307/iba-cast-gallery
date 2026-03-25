"use client";

import { useEffect, useState } from "react";
import {
    CircularProgress,
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

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

const ShiftList = ({ refreshKey }: { refreshKey: number }) => {
    const [groups, setGroups] = useState<ShiftGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        <TableContainer component={Paper} data-testid="shift-list">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>日付</TableCell>
                        <TableCell>曜日</TableCell>
                        <TableCell>シフト</TableCell>
                        <TableCell>キャスト</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groups.map((g, i) => (
                        <TableRow key={`${g.date}-${g.shift}`} data-testid={`shift-list-row-${i + 1}`}>
                            <TableCell>{g.date}</TableCell>
                            <TableCell>{g.dayOfWeek}</TableCell>
                            <TableCell>{SHIFT_LABELS[g.shift]}</TableCell>
                            <TableCell>{g.casts.map((c) => c.name).join("、")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ShiftList;
