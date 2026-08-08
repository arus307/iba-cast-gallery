import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * ギャラリーポストを「シフト登録候補」から恒久的に除外できるようにする。
 * 既存ポストはすべて候補のまま維持する。
 */
export class AddPostShiftRegistrationExclusion1786060800000
    implements MigrationInterface
{
    private readonly schema = process.env.DB_SCHEMA ?? "public";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "${this.schema}"."posts"
            ADD COLUMN "exclude_from_shift_registration" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "${this.schema}"."posts"
            DROP COLUMN "exclude_from_shift_registration"
        `);
    }
}
