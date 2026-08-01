"use client";

import {
    Alert,
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { PostRegistrationRequest, ShiftSlot } from "@iba-cast-gallery/types";
import CastMultiSelect, {
    CastOption,
} from "../../components/CastMultiSelect";
import { Tweet } from "../../components/tweet/swr";
import { extractPostId, getPostCreatedAtFromId } from "../../utils/postId";
import {
    inferShiftFromPostedAt,
    InferredShift,
} from "../../utils/shift";
import BlogPostPreview from "../../components/BlogPostPreview";

const SHIFT_LABELS: Record<ShiftSlot, string> = {
    [ShiftSlot.OPEN]: "オープン",
    [ShiftSlot.EVENING]: "夕方",
    [ShiftSlot.NIGHT]: "夜",
};

type RegistrationDetailResponse = {
    post: {
        postedAt: string;
        isDeleted: boolean;
        showInGallery: boolean;
        contentType: "gallery" | "blog";
        shiftSource: string | null;
        castTags: { castid: number; order: number }[];
    };
    shift: {
        date: string;
        slot: ShiftSlot;
        castIds: number[];
    } | null;
};

const getInitialShift = (): InferredShift =>
    inferShiftFromPostedAt(new Date()) ?? {
        date: dayjs().format("YYYY-MM-DD"),
        slot: ShiftSlot.NIGHT,
    };

const uniqueIds = (ids: number[]) => Array.from(new Set(ids));

const UnifiedTweetEditor = ({ initialId }: { initialId: string }) => {
    const router = useRouter();
    const isEditing = initialId !== "";
    const initialShift = getInitialShift();
    const [casts, setCasts] = useState<CastOption[]>([]);
    const [tweetId, setTweetId] = useState(initialId);
    const [tweetDateTime, setTweetDateTime] = useState<Dayjs | null>(dayjs());
    const [isDeleted, setIsDeleted] = useState(false);
    const [taggedCastIds, setTaggedCastIds] = useState<number[]>([]);
    const [shiftCastIds, setShiftCastIds] = useState<number[]>([]);
    const [registerGallery, setRegisterGallery] = useState(true);
    const [registerBlog, setRegisterBlog] = useState(false);
    const [registerShift, setRegisterShift] = useState(false);
    const [shiftDate, setShiftDate] = useState<Dayjs>(
        dayjs(initialShift.date),
    );
    const [shiftSlot, setShiftSlot] = useState<ShiftSlot>(initialShift.slot);
    const [showInGallery, setShowInGallery] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCasts = async () => {
            try {
                const response = await fetch("/api/casts");
                if (!response.ok) {
                    throw new Error();
                }
                setCasts(await response.json());
            } catch (error) {
                console.error("Error fetching casts:", error);
                setErrorMessage("キャスト一覧を取得できませんでした");
            }
        };
        void fetchCasts();
    }, []);

    const applyInferredShift = (dateTime: Dayjs) => {
        if (!dateTime.isValid()) {
            return;
        }
        const inferred = inferShiftFromPostedAt(dateTime.toISOString());
        if (inferred) {
            setShiftDate(dayjs(inferred.date));
            setShiftSlot(inferred.slot);
        }
    };

    useEffect(() => {
        const postId = extractPostId(tweetId);
        if (postId !== null && postId !== tweetId) {
            setTweetId(postId);
            return;
        }
        if (postId === null) {
            setShowInGallery(null);
            return;
        }

        const fetchRegistration = async () => {
            try {
                const response = await fetch(
                    `/api/post-registrations/${postId}`,
                );
                if (response.status === 404) {
                    setShowInGallery(null);
                    const createdAt = getPostCreatedAtFromId(postId);
                    if (createdAt) {
                        const dateTime = dayjs(createdAt);
                        setTweetDateTime(dateTime);
                        applyInferredShift(dateTime);
                    }
                    return;
                }
                if (!response.ok) {
                    throw new Error();
                }

                const detail: RegistrationDetailResponse =
                    await response.json();
                const dateTime = dayjs(detail.post.postedAt);
                const orderedTagIds = [...detail.post.castTags]
                    .sort((a, b) => a.order - b.order)
                    .map((tag) => tag.castid);
                setTweetDateTime(dateTime);
                setIsDeleted(detail.post.isDeleted);
                setTaggedCastIds(orderedTagIds);
                setShowInGallery(detail.post.showInGallery);
                const isBlog = detail.post.contentType === "blog";
                setRegisterBlog(isBlog);
                setRegisterGallery(
                    !isBlog &&
                        (detail.post.showInGallery ||
                            detail.post.shiftSource === null),
                );
                setRegisterShift(
                    detail.shift !== null ||
                        detail.post.shiftSource !== null,
                );

                if (detail.shift) {
                    setShiftDate(dayjs(detail.shift.date));
                    setShiftSlot(detail.shift.slot);
                    setShiftCastIds(
                        uniqueIds([
                            ...orderedTagIds,
                            ...detail.shift.castIds,
                        ]),
                    );
                } else {
                    applyInferredShift(dateTime);
                    setShiftCastIds(orderedTagIds);
                }
            } catch (error) {
                console.error("Error fetching post registration:", error);
                setErrorMessage("ポスト情報を取得できませんでした");
            }
        };
        void fetchRegistration();
    }, [tweetId]);

    const handleTaggedCastsChange = (castIds: number[]) => {
        setTaggedCastIds(castIds);
        if (registerShift) {
            setShiftCastIds((current) =>
                uniqueIds([...castIds, ...current]),
            );
        }
    };

    const handleShiftDestinationChange = (checked: boolean) => {
        setRegisterShift(checked);
        if (checked) {
            setRegisterBlog(false);
            setShiftCastIds((current) =>
                uniqueIds([...taggedCastIds, ...current]),
            );
        }
    };

    const save = async () => {
        if (saving) {
            return;
        }
        const postId = extractPostId(tweetId);
        if (postId === null || postId !== tweetId) {
            setErrorMessage("XのポストURLまたはポストIDを入力してください");
            return;
        }
        if (!registerGallery && !registerBlog && !registerShift) {
            setErrorMessage("登録先を1つ以上選択してください");
            return;
        }
        if (!tweetDateTime?.isValid()) {
            setErrorMessage("投稿日時を入力してください");
            return;
        }
        if (registerShift && shiftCastIds.length === 0) {
            setErrorMessage("出勤中のキャストを選択してください");
            return;
        }
        if (registerShift && !shiftDate.isValid()) {
            setErrorMessage("シフト日付を入力してください");
            return;
        }

        const request: PostRegistrationRequest = {
            postId,
            postedAt: tweetDateTime.toISOString(),
            isDeleted,
            destinations: {
                gallery: registerGallery,
                blog: registerBlog,
                shift: registerShift,
            },
            taggedCastIds: registerGallery || registerBlog ? taggedCastIds : [],
            shiftCastIds: registerShift
                ? uniqueIds([...taggedCastIds, ...shiftCastIds])
                : [],
            shift: registerShift
                ? {
                    date: shiftDate.format("YYYY-MM-DD"),
                    slot: shiftSlot,
                }
                : undefined,
        };

        setSaving(true);
        setErrorMessage(null);
        try {
            const response = await fetch("/api/post-registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.error ?? "登録に失敗しました");
            }
            if (registerGallery || registerBlog) {
                setShowInGallery(true);
            }
            if (isEditing) {
                router.push("/posts");
                router.refresh();
                return;
            }

            const nextShift = getInitialShift();
            setTweetId("");
            setTweetDateTime(dayjs());
            setTaggedCastIds([]);
            setShiftCastIds([]);
            setRegisterGallery(true);
            setRegisterBlog(false);
            setRegisterShift(false);
            setShiftDate(dayjs(nextShift.date));
            setShiftSlot(nextShift.slot);
            setIsDeleted(false);
            setShowInGallery(null);
        } catch (error) {
            console.error("Error registering post:", error);
            setErrorMessage(
                error instanceof Error ? error.message : "登録に失敗しました",
            );
        } finally {
            setSaving(false);
        }
    };

    const detectedShift = tweetDateTime?.isValid()
        ? inferShiftFromPostedAt(tweetDateTime.toISOString())
        : null;
    const normalizedPostId = extractPostId(tweetId);
    const saveDisabled =
        saving ||
        normalizedPostId === null ||
        normalizedPostId !== tweetId ||
        !tweetDateTime?.isValid() ||
        (!registerGallery && !registerBlog && !registerShift) ||
        (registerShift && shiftCastIds.length === 0);
    const buttonLabel =
        registerBlog
            ? "BLOGに登録"
            : registerGallery && registerShift
            ? "ギャラリーとシフトに登録"
            : registerShift
                ? "シフトに登録"
                : showInGallery === false
                    ? "ギャラリーに公開"
                    : "ギャラリーに登録";

    return (
        <Stack
            className="w-full"
            spacing={2}
            alignItems="stretch"
            sx={{ maxWidth: 720 }}
        >
            {showInGallery === false && (
                <Alert severity="info" data-testid="draft-status">
                    ドラフト保存済みです。このポストはギャラリー非公開で、ギャラリー登録を選ぶと公開されます。
                </Alert>
            )}
            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() => setErrorMessage(null)}
                    data-testid="post-registration-error"
                >
                    {errorMessage}
                </Alert>
            )}
            <TextField
                fullWidth
                value={tweetId}
                onChange={(event) => setTweetId(event.target.value)}
                label="XのポストURL または ID"
                size="small"
                disabled={isEditing}
                slotProps={{
                    htmlInput: { "data-testid": "tweet-id-input" },
                }}
            />
            {registerBlog ? (
                <BlogPostPreview
                    postId={normalizedPostId ?? ""}
                    postedAt={tweetDateTime?.isValid() ? tweetDateTime.toISOString() : null}
                />
            ) : (
                <Tweet id={tweetId} taggedCasts={[]} />
            )}

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2">登録先</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={registerGallery}
                                onChange={(_, checked) => {
                                    setRegisterGallery(checked);
                                    if (checked) {
                                        setRegisterBlog(false);
                                    }
                                    if (checked && registerShift) {
                                        setShiftCastIds((current) =>
                                            uniqueIds([
                                                ...taggedCastIds,
                                                ...current,
                                            ]),
                                        );
                                    }
                                }}
                                data-testid="gallery-destination-checkbox"
                            />
                        }
                        label="ギャラリーに登録"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={registerBlog}
                                onChange={(_, checked) => {
                                    setRegisterBlog(checked);
                                    if (checked) {
                                        setRegisterGallery(false);
                                        setRegisterShift(false);
                                    }
                                }}
                                data-testid="blog-destination-checkbox"
                            />
                        }
                        label="BLOGに登録"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={registerShift}
                                onChange={(_, checked) =>
                                    handleShiftDestinationChange(checked)
                                }
                                data-testid="shift-destination-checkbox"
                            />
                        }
                        label="シフトに登録"
                    />
                </Stack>
            </Paper>

            {(registerGallery || registerBlog) && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <CastMultiSelect
                        casts={casts}
                        value={taggedCastIds}
                        onChange={handleTaggedCastsChange}
                        ordered
                        label={registerBlog ? "タグ付けするキャストを選択" : "写ってるキャストを選択"}
                        helperText={registerBlog ? "BLOGに登場するキャストを選びます。並び順はドラッグで変更できます。" : "姿が写っているキャストだけを選びます。並び順はドラッグで変更できます。"}
                        testId="cast-autocomplete"
                    />
                </Paper>
            )}

            {registerShift && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle2">
                            シフト情報
                        </Typography>
                        {detectedShift && (
                            <Alert severity="info">
                                投稿時刻から「{detectedShift.date}・
                                {SHIFT_LABELS[detectedShift.slot]}」と判定しました。
                                必要なら変更できます。
                            </Alert>
                        )}
                        <CastMultiSelect
                            casts={casts.filter(
                                (cast) =>
                                    cast.isActive !== false ||
                                    shiftCastIds.includes(cast.id),
                            )}
                            value={shiftCastIds}
                            onChange={(castIds) =>
                                setShiftCastIds(
                                    uniqueIds([
                                        ...taggedCastIds,
                                        ...castIds,
                                    ]),
                                )
                            }
                            fixedIds={
                                registerGallery || registerBlog ? taggedCastIds : []
                            }
                            label="出勤中のキャストを選択"
                            helperText="写真タグのキャストは自動で含まれます。キャストボードにだけ載っているキャストを追加してください。"
                            testId="shift-cast-autocomplete"
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateField
                                label="シフト日付"
                                format="YYYY/MM/DD"
                                value={shiftDate}
                                onChange={(value) =>
                                    value && setShiftDate(value)
                                }
                                fullWidth
                                size="small"
                                slotProps={{
                                    textField: {
                                        inputProps: {
                                            "data-testid":
                                                "registration-shift-date-input",
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        <ToggleButtonGroup
                            value={shiftSlot}
                            exclusive
                            onChange={(_, value) =>
                                value && setShiftSlot(value)
                            }
                            fullWidth
                            size="small"
                        >
                            {Object.values(ShiftSlot).map((slot) => (
                                <ToggleButton
                                    key={slot}
                                    value={slot}
                                    data-testid={`registration-shift-slot-${slot}`}
                                >
                                    {SHIFT_LABELS[slot]}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>
            )}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimeField
                    format="YYYY/MM/DD HH:mm"
                    label="ポストの日時"
                    ampm={false}
                    value={tweetDateTime}
                    onChange={(value) => {
                        setTweetDateTime(value);
                        if (value) {
                            applyInferredShift(value);
                        }
                    }}
                />
            </LocalizationProvider>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isDeleted}
                        onChange={(_, checked) => setIsDeleted(checked)}
                    />
                }
                label="削除フラグ"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={save}
                disabled={saveDisabled}
                loading={saving}
                loadingPosition="start"
                data-testid="tweet-register-button"
            >
                {saving ? "登録中..." : buttonLabel}
            </Button>
        </Stack>
    );
};

export default UnifiedTweetEditor;
