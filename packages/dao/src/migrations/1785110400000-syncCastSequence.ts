import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * IDを明示して投入した初期キャストデータに採番シーケンスを追従させる。
 */
export class SyncCastSequence1785110400000 implements MigrationInterface {
    private readonly schema = process.env.DB_SCHEMA ?? "public";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            SELECT setval(
                pg_get_serial_sequence('"${this.schema}"."casts"', 'id'),
                COALESCE(MAX(id), 1),
                MAX(id) IS NOT NULL
            )
            FROM "${this.schema}"."casts"
        `);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // 既に採番されたIDとの衝突を避けるため、シーケンスは巻き戻さない。
    }
}
