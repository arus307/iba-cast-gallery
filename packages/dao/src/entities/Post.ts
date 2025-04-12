import { Column, Entity, OneToMany,JoinTable, PrimaryColumn, ManyToMany } from "typeorm";
import { Cast } from "./Cast";


@Entity('posts')
export class Post {

    @PrimaryColumn({length:30})
    id: string;

    @Column({
        name: "posted_at",
        type: "timestamp with time zone"
    })
    postedAt: string;

    @Column({
        name: "is_deleted",
        type: "boolean"
    })
    isDeleted: boolean;

    @ManyToMany(() => Cast, (cast)=>cast.taggedPosts, { onDelete: "CASCADE" })
    @JoinTable({
        name: "post_cast_tags",
        joinColumn: {
            name: "post_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "cast_id",
            referencedColumnName: "id"
        }
    })
    taggedCasts: Cast[];
}