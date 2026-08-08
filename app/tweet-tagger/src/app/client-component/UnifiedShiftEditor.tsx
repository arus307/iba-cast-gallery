"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Snackbar,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ShiftSlot } from "@iba-cast-gallery/types";
import CastMultiSelect, {
    CastOption,
} from "../../components/CastMultiSelect";
import { Tweet } from "../../components/tweet/swr";
import { extractPostId } from "../../utils/postId";

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

type ShiftSelectionRequest = {
    date: string;
    slot: ShiftSlot;
    sourcePostId?: string | null;
    requestId: number;
};

const UnifiedShiftEditor = ({
    onSaved,
    selectionRequest,
}: {
    onSaved?: () => void;
    selectionRequest?: ShiftSelectionRequest | null;
}) => {
    const [casts, setCasts] = useState<CastOption[]>([]);
    const [tweetInput, setTweetInput] = useState("");
    const [tweetId, setTweetId] = useState("");
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [slot, setSlot] = useState<ShiftSlot>(ShiftSlot.NIGHT);
    const [selectedCastIds, setSelectedCastIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetch("/api/casts")
            .then((response) => response.json())
            .then(setCasts)
            .catch(console.error);
    }, []);

    useEffect(() => {
        setTweetId(extractPostId(tweetInput) ?? "");
    }, [tweetInput]);

    useEffect(() => {
        if (!selectionRequest) {
            return;
        }

        setDate(dayjs(selectionRequest.date));
        setSlot(selectionRequest.slot);
    }, [selectionRequest]);

    useEffect(() => {
        if (!date?.isValid()) {
            return;
        }

        const dateString = date.format("YYYY-MM-DD");
        const controller = new AbortController();
        const fetchExisting = async () => {
            try {
                const response = await fetch(
                    `/api/shifts?date=${dateString}&shift=${slot}`,
                    { signal: controller.signal },
                );
                if (!response.ok) {
                    return;
                }
                const data: {
                    castIds: number[];
                    sourcePostId: string | null;
                } = await response.json();
                setSelectedCastIds(data.castIds);

                const isRequestedShift =
                    selectionRequest?.date === dateString &&
                    selectionRequest.slot === slot;
                setTweetInput(
                    isRequestedShift && selectionRequest.sourcePostId !== undefined
                        ? selectionRequest.sourcePostId ?? ""
                        : data.sourcePostId ?? "",
                );
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error(error);
            }
        };

        void fetchExisting();
        return () => controller.abort();
    }, [date, selectionRequest, slot]);

    const save = async () => {
        if (!date?.isValid() || saving) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: date.format("YYYY-MM-DD"),
                    shift: slot,
                    castIds: selectedCastIds,
                    sourcePostId: tweetId || null,
                }),
            });
            if (!response.ok) {
                throw new Error();
            }
            setSnackbar({
                open: true,
                message: "保存しました！",
                severity: "success",
            });
            onSaved?.();
        } catch {
            setSnackbar({
                open: true,
                message: "保存に失敗しました",
                severity: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 720 }}>
            <TextField
                fullWidth
                label="ツイートURL または ID"
                value={tweetInput}
                onChange={(event) => setTweetInput(event.target.value)}
                size="small"
                placeholder="https://x.com/.../status/..."
                slotProps={{
                    htmlInput: {
                        "data-testid": "shift-tweet-url-input",
                    },
                }}
            />
            {tweetId && <Tweet id={tweetId} taggedCasts={[]} />}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                    label="日付"
                    format="YYYY/MM/DD"
                    value={date}
                    onChange={(value) => value && setDate(value)}
                    fullWidth
                    size="small"
                    slotProps={{
                        textField: {
                            inputProps: {
                                "data-testid": "shift-date-input",
                            },
                        },
                    }}
                />
            </LocalizationProvider>

            <ToggleButtonGroup
                value={slot}
                exclusive
                onChange={(_, value) => value && setSlot(value)}
                fullWidth
                size="small"
            >
                {Object.values(ShiftSlot).map((shiftSlot) => (
                    <ToggleButton key={shiftSlot} value={shiftSlot}>
                        {SHIFT_LABELS[shiftSlot]}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <CastMultiSelect
                casts={casts.filter(
                    (cast) =>
                        cast.isActive !== false ||
                        selectedCastIds.includes(cast.id),
                )}
                value={selectedCastIds}
                onChange={setSelectedCastIds}
                label="出勤中のキャストを選択"
                helperText="名前をひらがな・カタカナで検索して複数選択できます。"
                testId="standalone-shift-cast-autocomplete"
            />

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
                onClose={() =>
                    setSnackbar((current) => ({
                        ...current,
                        open: false,
                    }))
                }
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() =>
                        setSnackbar((current) => ({
                            ...current,
                            open: false,
                        }))
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};

export default UnifiedShiftEditor;
