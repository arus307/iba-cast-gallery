import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitCastEventType1774396800001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE event_type_enum RENAME VALUE 'cast_event' TO 'cast_event_shop'`);
        await queryRunner.query(`ALTER TYPE event_type_enum ADD VALUE 'cast_event_live'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // cast_event_live の削除は PostgreSQL では不可のため RENAME のみ戻す
        await queryRunner.query(`ALTER TYPE event_type_enum RENAME VALUE 'cast_event_shop' TO 'cast_event'`);
    }
}
