import { PrimaryColumn, Index, Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

/**
 * ユーザーのログインアカウントを表すエンティティ
 */
@Entity('user_accounts')
@Index(['userId', 'provider'], { unique: true }) // 各ユーザーに紐づく同一プロバイダーのアカウントは一つだけ紐づく
export class UserAccount {

    /**
     * ユーザーID
     */
    @Column({
        name: "user_id",
    })
    userId: number;

    /**
     * ログインに利用しているprovider
     */
    @PrimaryColumn({
        type: "varchar",
        length: 30,
    })
    provider: string;

    /**
     * providerから提供されたアカウントのID
     */
    @PrimaryColumn({
        name: "provider_account_id",
        type: "varchar",
        length: 100,
    })
    providerAccountId: string;

    @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User
}