"use client";

import { useState } from "react";
import { Divider, Typography } from "@mui/material";
import { EventDto } from "@iba-cast-gallery/types";
import EventEditor from "app/client-component/EventEditor";
import EventList from "app/client-component/EventList";

const EventPageContent = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editTarget, setEditTarget] = useState<EventDto | null>(null);

    const handleSaved = () => {
        setRefreshKey((k) => k + 1);
        setEditTarget(null);
    };

    return (
        <>
            <EventEditor
                onSaved={handleSaved}
                editTarget={editTarget}
                onCancelEdit={() => setEditTarget(null)}
            />
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>登録済みイベント一覧</Typography>
            <EventList refreshKey={refreshKey} onEdit={setEditTarget} />
        </>
    );
};

export default EventPageContent;
