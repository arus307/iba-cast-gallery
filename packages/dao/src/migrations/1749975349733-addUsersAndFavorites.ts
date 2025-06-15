import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersAndFavorites1749975349733 implements MigrationInterface {
    name = 'AddUsersAndFavorites1749975349733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_accounts" ("user_id" integer NOT NULL, "provider" character varying(30) NOT NULL, "provider_account_id" character varying(100) NOT NULL, CONSTRAINT "PK_1f539a69d5a5e1b28d3af061ad4" PRIMARY KEY ("provider", "provider_account_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0f6a300df892fd1f6267fdd7c9" ON "user_accounts" ("user_id", "provider") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "post_id" character varying(30) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9ba72c63a55d5b8f7deee76b1c" ON "favorites" ("user_id", "post_id") `);
        await queryRunner.query(`ALTER TABLE "user_accounts" ADD CONSTRAINT "FK_6711686e2dc4fcf9c7c83b83735" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_0be5be648c69c6b654efde5181d" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_0be5be648c69c6b654efde5181d"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`);
        await queryRunner.query(`ALTER TABLE "user_accounts" DROP CONSTRAINT "FK_6711686e2dc4fcf9c7c83b83735"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ba72c63a55d5b8f7deee76b1c"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f6a300df892fd1f6267fdd7c9"`);
        await queryRunner.query(`DROP TABLE "user_accounts"`);
    }

}
