import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { Cast } from "./Cast";
import { Post } from "./Post";

@Entity('shifts')
export class Shift {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "date" })
    date: string;

    @Column({ type: "enum", enum: ShiftSlot })
    shift: ShiftSlot;

    @Column({ name: "cast_id" })
    castId: number;

    @ManyToOne(() => Cast)
    @JoinColumn({ name: "cast_id" })
    cast: Cast;

    @Column({ name: "source_post_id", type: "varchar", length: 30, nullable: true, default: null })
    sourcePostId: string | null;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: "source_post_id" })
    sourcePost: Post | null;

    @Column({ name: "created_at", type: "timestamptz", default: () => "NOW()" })
    createdAt: Date;
}
