import "server-only";
import 'reflect-metadata';
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";
import { Cast } from "@iba-cast-gallery/dao";
import { CastType } from "@iba-cast-gallery/types";

export class DuplicateCastError extends Error {
    constructor() {
        super("A cast with the same name, English name, or introduction post already exists");
        this.name = "DuplicateCastError";
    }
}

export interface CreateCastInput {
    name: string;
    enName: string;
    introduceTweetId: string;
    type: CastType;
    isActive: boolean;
    fanMark: string;
}

/**
 * キャスト情報を全件取得する
 */
export async function getAllCasts(): Promise<Cast[]> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const casts = await castRepository.find({
        order: {
            id: "ASC",
        },
    });

    return casts;
}

/**
 * キャスト情報を新規登録する
 */
export async function createCast(input: CreateCastInput): Promise<Cast> {
    await initializeDatabase();

    const castRepository: Repository<Cast> = appDataSource.getRepository(Cast);
    const duplicate = await castRepository.findOne({
        where: [
            { name: input.name },
            { enName: input.enName },
            { introduceTweetId: input.introduceTweetId },
        ],
    });
    if (duplicate) {
        throw new DuplicateCastError();
    }

    const cast = castRepository.create(input);
    return castRepository.save(cast);
}
