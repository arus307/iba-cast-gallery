import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShiftSourceToPostsAndSourcePostToShifts1774310400000 implements MigrationInterface {
    name = 'AddShiftSourceToPostsAndSourcePostToShifts1774310400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."posts_shift_source_enum" AS ENUM('pending', 'done')`);
        await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "show_in_gallery" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "shift_source" "public"."posts_shift_source_enum" NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD COLUMN "source_post_id" character varying(30) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_shifts_source_post_id" FOREIGN KEY ("source_post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_shifts_source_post_id"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "source_post_id"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "shift_source"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "show_in_gallery"`);
        await queryRunner.query(`DROP TYPE "public"."posts_shift_source_enum"`);
    }
}
