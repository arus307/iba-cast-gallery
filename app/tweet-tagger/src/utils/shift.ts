import { ShiftSlot } from "@iba-cast-gallery/types";

const OPEN_END_MINUTES = 16 * 60 + 30;
const EVENING_END_MINUTES = 18 * 60 + 30;

export type InferredShift = {
    date: string;
    slot: ShiftSlot;
};

/**
 * 投稿日時を日本時間に変換し、投稿日とシフト枠を推定する。
 */
export function inferShiftFromPostedAt(
    postedAt: string | Date,
): InferredShift | null {
    const date = postedAt instanceof Date ? postedAt : new Date(postedAt);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value]),
    );

    const hour = Number(values.hour);
    const minute = Number(values.minute);
    if (
        !values.year ||
        !values.month ||
        !values.day ||
        Number.isNaN(hour) ||
        Number.isNaN(minute)
    ) {
        return null;
    }

    const minutes = hour * 60 + minute;
    const slot =
        minutes < OPEN_END_MINUTES
            ? ShiftSlot.OPEN
            : minutes < EVENING_END_MINUTES
                ? ShiftSlot.EVENING
                : ShiftSlot.NIGHT;

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        slot,
    };
}
