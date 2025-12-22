import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFanMarkToCasts1766420597916 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "casts" ADD "fan_mark" character varying(20) NOT NULL DEFAULT '-'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "casts" DROP COLUMN "fan_mark"`);
    }

}
