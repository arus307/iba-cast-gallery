import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderToTag1746521146522 implements MigrationInterface {
    name = 'AddOrderToTag1746521146522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_cast_tags" DROP CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40b22c3bbf7283b1a6adb2df3e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b96305a7d9fd0c3a5c99adde73"`);
        await queryRunner.query(`ALTER TABLE "post_cast_tags" ADD "order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post_cast_tags" ADD CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_cast_tags" DROP CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9"`);
        await queryRunner.query(`ALTER TABLE "post_cast_tags" DROP COLUMN "order"`);
        await queryRunner.query(`CREATE INDEX "IDX_b96305a7d9fd0c3a5c99adde73" ON "post_cast_tags" ("cast_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_40b22c3bbf7283b1a6adb2df3e" ON "post_cast_tags" ("post_id") `);
        await queryRunner.query(`ALTER TABLE "post_cast_tags" ADD CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
