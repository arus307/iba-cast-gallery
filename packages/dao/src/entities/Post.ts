import { Column, Entity, OneToMany, JoinTable, PrimaryColumn, ManyToMany } from "typeorm";
import { Cast } from "./Cast";
import { PostCastTag } from "./PostCastTag";
import { Favorite } from "./Favorite";

@Entity('posts')
export class Post {

  @PrimaryColumn({ length: 30 })
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

  /**
   * キャストのタグ付情報
   */
  @OneToMany(() => PostCastTag, (postCastTag) => postCastTag.post, { cascade: ['insert', 'update'], orphanedRowAction: 'delete', eager: true })
  castTags: PostCastTag[];

  /**
   * お気に入り情報
   */
  @OneToMany(() => Favorite, (favorite) => favorite.post)
  favorites: Favorite[];

  /**
   * タグ付けされたキャスト情報
   */
  get taggedCasts(): Cast[] {
    if (!this.castTags) {
      return [];
    }
    // 順序でソートしてCastのみを返す
    return this.castTags
      .sort((a, b) => a.order - b.order)
      .map(castTag => castTag.cast);
  }
}