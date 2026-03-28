import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EventType } from "@iba-cast-gallery/types";
import { Post } from "./Post";
import { EventCastTag } from "./EventCastTag";

@Entity('events')
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "event_type", type: "enum", enum: EventType })
    eventType: EventType;

    @Column({ type: "varchar", length: 100 })
    title: string;

    @Column({ name: "date_start", type: "date" })
    dateStart: string;

    @Column({ name: "date_end", type: "date" })
    dateEnd: string;

    @Column({ name: "time_note", type: "varchar", length: 50, nullable: true, default: null })
    timeNote: string | null;

    @Column({ type: "text", nullable: true, default: null })
    notes: string | null;

    @Column({ name: "source_post_id", type: "varchar", length: 30, nullable: true, default: null })
    sourcePostId: string | null;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: "source_post_id" })
    sourcePost: Post | null;

    @OneToMany(() => EventCastTag, (tag) => tag.event, { eager: true, cascade: true })
    castTags: EventCastTag[];
}
