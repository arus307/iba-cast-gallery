"use client";

import { useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import ShiftEditor from "app/client-component/UnifiedShiftEditor";
import ShiftList from "app/client-component/ShiftList";
import { ShiftSlot } from "@iba-cast-gallery/types";

const ShiftPageContent = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectionRequest, setSelectionRequest] = useState<{
        date: string;
        slot: ShiftSlot;
        requestId: number;
    } | null>(null);

    const fillMissingShift = (date: string, slot: ShiftSlot) => {
        setSelectionRequest({ date, slot, requestId: Date.now() });
        window.requestAnimationFrame(() => {
            document.getElementById("shift-editor")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    return (
        <>
            <Box id="shift-editor" sx={{ scrollMarginTop: 16 }}>
                <ShiftEditor
                    onSaved={() => setRefreshKey((k) => k + 1)}
                    selectionRequest={selectionRequest}
                />
            </Box>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>登録済みシフト一覧</Typography>
            <ShiftList refreshKey={refreshKey} onFillMissing={fillMissingShift} />
        </>
    );
};

export default ShiftPageContent;
