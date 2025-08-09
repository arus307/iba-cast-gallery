import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1744384855087 implements MigrationInterface {
    name = 'InitDB1744384855087'
    schema = process.env.DB_SCHEMA || 'public';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "${this.schema}"."casts_type_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "${this.schema}"."casts" ("id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "en_name" character varying(30) NOT NULL, "introduce_tweet_id" character varying(100) NOT NULL, "type" "casts_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a7f4a967c0ef1bed2585ff061b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${this.schema}"."posts" ("id" character varying(30) NOT NULL, "posted_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_deleted" boolean NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${this.schema}"."post_cast_tags" ("post_id" character varying(30) NOT NULL, "cast_id" integer NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_17fa77740414b39f9b223b001d6" PRIMARY KEY ("post_id", "cast_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40b22c3bbf7283b1a6adb2df3e" ON "${this.schema}"."post_cast_tags" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b96305a7d9fd0c3a5c99adde73" ON "${this.schema}"."post_cast_tags" ("cast_id") `);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."post_cast_tags" ADD CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9" FOREIGN KEY ("post_id") REFERENCES "${this.schema}"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."post_cast_tags" ADD CONSTRAINT "FK_b96305a7d9fd0c3a5c99adde730" FOREIGN KEY ("cast_id") REFERENCES "${this.schema}"."casts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "${this.schema}"."post_cast_tags" DROP CONSTRAINT "FK_b96305a7d9fd0c3a5c99adde730"`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."post_cast_tags" DROP CONSTRAINT "FK_40b22c3bbf7283b1a6adb2df3e9"`);
        await queryRunner.query(`DROP INDEX "${this.schema}"."IDX_b96305a7d9fd0c3a5c99adde73"`);
        await queryRunner.query(`DROP INDEX "${this.schema}"."IDX_40b22c3bbf7283b1a6adb2df3e"`);
        await queryRunner.query(`DROP TABLE "${this.schema}"."post_cast_tags"`);
        await queryRunner.query(`DROP TABLE "${this.schema}"."posts"`);
        await queryRunner.query(`DROP TABLE "${this.schema}"."casts"`);
        await queryRunner.query(`DROP TYPE "${this.schema}"."casts_type_enum"`);
    }

}
