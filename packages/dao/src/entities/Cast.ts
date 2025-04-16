import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { CastType } from "@iba-cast-gallery/types";

/**
 * キャストのエンティティ
 */
@Entity('casts')
export class Cast {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type:"varchar",        
        length:30,
    })
    name:string;

    @Column({
        name:"en_name",
        type:"varchar",
        length:30
    })
    enName:string;

    @Column({
        name:"introduce_tweet_id",
        type:"varchar",
        length:100
    })
    introduceTweetId:string;

    @Column({
        type: "enum",
        enum: CastType,
    })
    type: CastType;

    @Column({
        name:"is_active",
        type:"boolean",
        default:true
    })
    isActive:boolean;

    @ManyToMany(() => Post, (post) => post.taggedCasts, { onDelete: "CASCADE" })
    taggedPosts: Post[];
}
