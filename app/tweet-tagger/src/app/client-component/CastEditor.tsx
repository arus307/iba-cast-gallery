"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
    Alert,
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { CastType } from "@iba-cast-gallery/types";
import { Tweet } from "../../components/tweet/swr";
import { extractPostId } from "utils/postId";

const CAST_TYPE_LABELS: Record<CastType, string> = {
    [CastType.REAL]: "リアルキャスト (RC)",
    [CastType.IMAGINARY]: "イマジナリーキャスト (IC)",
};

type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error";
};

const CastEditor = () => {
    const [name, setName] = useState("");
    const [enName, setEnName] = useState("");
    const [introduceTweetInput, setIntroduceTweetInput] = useState("");
    const [type, setType] = useState<CastType>(CastType.REAL);
    const [fanMark, setFanMark] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });

    const introduceTweetId = extractPostId(introduceTweetInput);
    const isValid = name.trim().length > 0
        && name.trim().length <= 30
        && enName.trim().length > 0
        && enName.trim().length <= 30
        && fanMark.trim().length <= 20
        && introduceTweetId !== null;

    const resetForm = () => {
        setName("");
        setEnName("");
        setIntroduceTweetInput("");
        setType(CastType.REAL);
        setFanMark("");
        setIsActive(true);
    };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValid || !introduceTweetId) return;

        setSaving(true);
        try {
            const response = await fetch("/api/casts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    enName: enName.trim(),
                    introduceTweetId,
                    type,
                    isActive,
                    fanMark: fanMark.trim(),
                }),
            });

            if (response.status === 409) {
                setSnackbar({
                    open: true,
                    message: "同じ名前・英語名・紹介ポストのキャストがすでに登録されています",
                    severity: "error",
                });
                return;
            }
            if (!response.ok) {
                throw new Error(`Failed to create cast: ${response.status}`);
            }

            resetForm();
            setSnackbar({
                open: true,
                message: "キャストを登録しました！",
                severity: "success",
            });
        } catch (error) {
            console.error(error);
            setSnackbar({
                open: true,
                message: "キャストの登録に失敗しました",
                severity: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const hasInvalidPostInput = introduceTweetInput.length > 0 && !introduceTweetId;

    return (
        <Stack
            component="form"
            spacing={3}
            sx={{ width: "100%", maxWidth: 600 }}
            onSubmit={save}
        >
            <TextField
                required
                fullWidth
                label="キャスト名"
                value={name}
                onChange={(event) => setName(event.target.value)}
                size="small"
                inputProps={{ maxLength: 30, "data-testid": "cast-name-input" }}
                helperText={`${name.length}/30`}
            />

            <TextField
                required
                fullWidth
                label="英語名"
                value={enName}
                onChange={(event) => setEnName(event.target.value)}
                size="small"
                inputProps={{ maxLength: 30, "data-testid": "cast-en-name-input" }}
                helperText={`${enName.length}/30`}
            />

            <FormControl fullWidth size="small">
                <InputLabel id="cast-type-label">種別</InputLabel>
                <Select
                    labelId="cast-type-label"
                    label="種別"
                    value={type}
                    onChange={(event) => setType(Number(event.target.value) as CastType)}
                    inputProps={{ "data-testid": "cast-type-select" }}
                >
                    {[CastType.REAL, CastType.IMAGINARY].map((castType) => (
                        <MenuItem key={castType} value={castType}>
                            {CAST_TYPE_LABELS[castType]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                required
                fullWidth
                label="紹介ポスト URL または ID"
                value={introduceTweetInput}
                onChange={(event) => setIntroduceTweetInput(event.target.value)}
                size="small"
                placeholder="https://x.com/.../status/..."
                error={hasInvalidPostInput}
                helperText={hasInvalidPostInput
                    ? "XのポストURLまたはポストIDを入力してください"
                    : "登録前にポストのプレビューを確認できます"}
                inputProps={{ "data-testid": "cast-introduce-post-input" }}
            />

            {introduceTweetId && (
                <Stack spacing={1} data-testid="cast-introduce-post-preview">
                    <Typography variant="caption" color="text.secondary">
                        紹介ポストのプレビュー
                    </Typography>
                    <Tweet id={introduceTweetId} taggedCasts={[]} />
                </Stack>
            )}

            <TextField
                fullWidth
                label="ファンマーク（任意）"
                value={fanMark}
                onChange={(event) => setFanMark(event.target.value)}
                size="small"
                inputProps={{ maxLength: 20, "data-testid": "cast-fan-mark-input" }}
                helperText={`${fanMark.length}/20（未入力時は「-」で保存）`}
            />

            <FormControlLabel
                control={(
                    <Switch
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                        data-testid="cast-active-switch"
                    />
                )}
                label="活動中のキャストとして登録"
            />

            <Button
                type="submit"
                variant="contained"
                disabled={!isValid || saving}
                loading={saving}
                loadingPosition="start"
                data-testid="cast-save-button"
            >
                {saving ? "登録中..." : "登録する"}
            </Button>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};

export default CastEditor;
