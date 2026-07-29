"use client";

import { useState } from "react";
import { Divider, Typography } from "@mui/material";
import ShiftEditor from "app/client-component/UnifiedShiftEditor";
import ShiftList from "app/client-component/ShiftList";

const ShiftPageContent = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <>
            <ShiftEditor onSaved={() => setRefreshKey((k) => k + 1)} />
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>登録済みシフト一覧</Typography>
            <ShiftList refreshKey={refreshKey} />
        </>
    );
};

export default ShiftPageContent;
