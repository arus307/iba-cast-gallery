import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShiftSourceToPostsAndSourcePostToShifts1774310400000 implements MigrationInterface {
    name = 'AddShiftSourceToPostsAndSourcePostToShifts1774310400000'
    schema = process.env.DB_SCHEMA || 'public';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "${this.schema}"."posts_shift_source_enum" AS ENUM('pending', 'done')`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."posts" ADD COLUMN "show_in_gallery" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."posts" ADD COLUMN "shift_source" "${this.schema}"."posts_shift_source_enum" NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."shifts" ADD COLUMN "source_post_id" character varying(30) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."shifts" ADD CONSTRAINT "FK_shifts_source_post_id" FOREIGN KEY ("source_post_id") REFERENCES "${this.schema}"."posts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "${this.schema}"."shifts" DROP CONSTRAINT "FK_shifts_source_post_id"`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."shifts" DROP COLUMN "source_post_id"`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."posts" DROP COLUMN "shift_source"`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."posts" DROP COLUMN "show_in_gallery"`);
        await queryRunner.query(`DROP TYPE "${this.schema}"."posts_shift_source_enum"`);
    }
}
