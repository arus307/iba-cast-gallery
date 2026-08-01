import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 画像ギャラリー用ポストと IBAだいありぃ BLOG ポストを区別する。
 * 指定された BLOG ポストをルチルのタグ付きで初期登録する。
 */
export class AddBlogPostType1785542400000 implements MigrationInterface {
    private readonly schema = process.env.DB_SCHEMA ?? "public";
    private readonly samplePostId = "1978264565742973070";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "${this.schema}"."posts_content_type_enum" AS ENUM ('gallery', 'blog')
        `);
        await queryRunner.query(`
            ALTER TABLE "${this.schema}"."posts"
            ADD COLUMN "content_type" "${this.schema}"."posts_content_type_enum"
            NOT NULL DEFAULT 'gallery'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_posts_content_type_posted_at"
            ON "${this.schema}"."posts" ("content_type", "posted_at" DESC)
        `);

        await queryRunner.query(
            `
                INSERT INTO "${this.schema}"."posts"
                    ("id", "posted_at", "is_deleted", "show_in_gallery", "content_type")
                VALUES ($1, $2, false, true, 'blog')
                ON CONFLICT ("id") DO UPDATE
                SET "posted_at" = EXCLUDED."posted_at",
                    "is_deleted" = false,
                    "show_in_gallery" = true,
                    "content_type" = 'blog'
            `,
            [this.samplePostId, "2025-10-15T01:00:01.508Z"],
        );
        await queryRunner.query(
            `
                INSERT INTO "${this.schema}"."post_cast_tags"
                    ("post_id", "cast_id", "order")
                VALUES ($1, 21, 1)
                ON CONFLICT ("post_id", "cast_id") DO NOTHING
            `,
            [this.samplePostId],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "${this.schema}"."posts" WHERE "id" = $1 AND "content_type" = 'blog'`,
            [this.samplePostId],
        );
        await queryRunner.query(`DROP INDEX "${this.schema}"."IDX_posts_content_type_posted_at"`);
        await queryRunner.query(`ALTER TABLE "${this.schema}"."posts" DROP COLUMN "content_type"`);
        await queryRunner.query(`DROP TYPE "${this.schema}"."posts_content_type_enum"`);
    }
}
