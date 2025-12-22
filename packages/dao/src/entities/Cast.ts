import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CastType } from "@iba-cast-gallery/types";
import { Post } from "./Post";
import { PostCastTag } from "./PostCastTag";
import dayjs from "dayjs";

/**
 * キャストのエンティティ
 */
@Entity('casts')
export class Cast {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 30,
    })
    name: string;

    @Column({
        name: "en_name",
        type: "varchar",
        length: 30
    })
    enName: string;

    @Column({
        name: "introduce_tweet_id",
        type: "varchar",
        length: 100
    })
    introduceTweetId: string;

    @Column({
        type: "enum",
        enum: CastType,
    })
    type: CastType;

    @Column({
        name: "is_active",
        type: "boolean",
        default: true
    })
    isActive: boolean;

    @Column({
        name: "fan_mark",
        type: "varchar",
        length: 20,
        default: "-"
    })
    fanMark: string;

    @OneToMany(() => PostCastTag, (postCastTag) => postCastTag.cast, { onDelete: "CASCADE" })
    postCastTags: PostCastTag[];

    /**
     * キャストがタグ付けされているポスト一覧
     */
    get taggedPosts(): Post[] {
        if (!this.postCastTags) {
            return [];
        }
        // 投稿日順でソートしてPostのみを返す
        return this.postCastTags
            .sort((a, b) => dayjs(a.post.postedAt).isAfter(dayjs(b.post.postedAt)) ? -1 : 1)
            .map(postCastTag => postCastTag.post);
    }
}
