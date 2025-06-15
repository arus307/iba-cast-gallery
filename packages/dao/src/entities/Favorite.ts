import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, Timestamp } from 'typeorm';
import {User} from './User';
import {Post} from './Post';

/**
 * ユーザーのお気に入り投稿を表すエンティティ
 */
@Entity('favorites')
@Index(['user', 'post'], { unique: true }) // ユーザーとポストの組み合わせは一意
export class Favorite {


    @PrimaryGeneratedColumn()
    id: number;

    /**
     * お気に入りしたユーザーID
     */
    @Column({
        name: "user_id",
    })
    userId: number;

    /**
     * お気に入りのポストID
     */
    @Column({
        name:"post_id",
        length: 30})
    postId: string;

    /**
     * お気に入り登録日時
     */
    @CreateDateColumn({
        name: "created_at",
        type: "timestamp with time zone",
    })
    createdAt: Timestamp;

    /**
     * お気に入りしたユーザー
     */
    @ManyToOne(() => User, (user)=> user.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * お気に入りのポスト
     */
    @ManyToOne(() => Post, (post) => post.favorites, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;
}
