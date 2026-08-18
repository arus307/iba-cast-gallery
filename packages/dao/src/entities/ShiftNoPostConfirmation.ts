import { Column, Entity, PrimaryColumn } from "typeorm";
import { ShiftSlot } from "@iba-cast-gallery/types";

/**
 * シフト情報ポストが公開されなかったことを管理者が確認した記録。
 * 日付と時間帯の組み合わせを自然キーとして重複登録を防ぐ。
 */
@Entity("shift_no_post_confirmations")
export class ShiftNoPostConfirmation {
    @PrimaryColumn({ type: "date" })
    date: string;

    @PrimaryColumn({
        type: "enum",
        enum: ShiftSlot,
        enumName: "shifts_shift_enum",
    })
    shift: ShiftSlot;

    @Column({
        name: "confirmed_at",
        type: "timestamptz",
        default: () => "NOW()",
    })
    confirmedAt: Date;
}
