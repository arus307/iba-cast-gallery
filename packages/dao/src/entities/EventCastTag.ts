import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Event } from "./Event";
import { Cast } from "./Cast";

@Entity('event_cast_tags')
export class EventCastTag {

    @PrimaryColumn({ name: "event_id" })
    eventId: number;

    @PrimaryColumn({ name: "cast_id" })
    castId: number;

    @Column({ type: "int", default: 0 })
    order: number;

    @ManyToOne(() => Event, (event) => event.castTags, { onDelete: "CASCADE" })
    @JoinColumn({ name: "event_id" })
    event: Event;

    @ManyToOne(() => Cast, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "cast_id" })
    cast: Cast;
}
