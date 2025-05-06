import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Cast } from "./Cast";
import { Post } from "./Post";

/**
 * ポストのタグ付け情報のエンティティ
 */
@Entity('post_cast_tags')
export class PostCastTag {

  @PrimaryColumn({
    name: "post_id",
    type: "varchar",
    length: 30
  })
  postId: string;


  @PrimaryColumn({
    name: "cast_id"
  })
  castid: number;

  @Column({
    name: "order",
    type: "int",
    default: 0
  })
  order: number;

  @ManyToOne(() => Post, (post) => post.castTags, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @ManyToOne(() => Cast, (cast) => cast.id, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'cast_id', referencedColumnName: 'id' })
  cast: Cast;
}