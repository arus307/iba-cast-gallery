import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum CastType {
    REAL = 1,
    IMAGINARY = 2,
}

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
}
