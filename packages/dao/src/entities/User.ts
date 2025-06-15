import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import {Favorite} from './Favorite';
import {UserAccount} from './UserAccount';

/**
 * ログインユーザーのエンティティ
 */
@Entity('users')
export class User {

    /**
     * ユーザーID
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ユーザーのお気に入り
     */
    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[];

    /**
     * ユーザーのSNSアカウント情報
     */
    @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
    accounts: UserAccount[];
}