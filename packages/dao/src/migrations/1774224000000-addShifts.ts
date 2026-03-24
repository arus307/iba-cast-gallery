import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShifts1774224000000 implements MigrationInterface {
    name = 'AddShifts1774224000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shifts_shift_enum" AS ENUM('open', 'evening', 'night')`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" SERIAL NOT NULL, "date" date NOT NULL, "shift" "public"."shifts_shift_enum" NOT NULL, "cast_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_shifts" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_shifts_date_shift_cast" ON "shifts" ("date", "shift", "cast_id")`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_shifts_cast_id" FOREIGN KEY ("cast_id") REFERENCES "casts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_shifts_cast_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_shifts_date_shift_cast"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`DROP TYPE "public"."shifts_shift_enum"`);
    }
}
