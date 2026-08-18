import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * シフト情報ポストが存在しないことを確認済みとして記録する。
 */
export class AddShiftNoPostConfirmations1786320000000
    implements MigrationInterface
{
    private readonly schema = process.env.DB_SCHEMA ?? "public";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "${this.schema}"."shift_no_post_confirmations" (
                "date" date NOT NULL,
                "shift" "${this.schema}"."shifts_shift_enum" NOT NULL,
                "confirmed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_shift_no_post_confirmations"
                    PRIMARY KEY ("date", "shift")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "${this.schema}"."shift_no_post_confirmations"
        `);
    }
}
