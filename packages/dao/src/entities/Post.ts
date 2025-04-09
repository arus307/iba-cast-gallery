// ポストのエンティティ

import { Column, Entity, ManyToMany,JoinTable } from "typeorm";
import { Cast } from "./Cast";


@Entity('posts')
export class Post {

    @Column({length:30, unique:true})
    id: string;

    @Column("posted_at")
    postedAt: Date;

    @ManyToMany(() => Cast)
    @JoinTable({name:"post_cast_tags"})
    taggedCasts: Cast[];
}