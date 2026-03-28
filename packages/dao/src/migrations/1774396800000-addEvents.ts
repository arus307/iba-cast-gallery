import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEvents1774396800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE event_type_enum AS ENUM ('cast_event', 'kamitsubaki', 'collab')
        `);

        await queryRunner.query(`
            CREATE TABLE events (
                id SERIAL PRIMARY KEY,
                event_type event_type_enum NOT NULL,
                title VARCHAR(100) NOT NULL,
                date_start DATE NOT NULL,
                date_end DATE NOT NULL,
                time_note VARCHAR(50) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                source_post_id VARCHAR(30) DEFAULT NULL,
                CONSTRAINT fk_events_source_post FOREIGN KEY (source_post_id) REFERENCES posts(id) ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE event_cast_tags (
                event_id INTEGER NOT NULL,
                cast_id INTEGER NOT NULL,
                "order" INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (event_id, cast_id),
                CONSTRAINT fk_event_cast_tags_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                CONSTRAINT fk_event_cast_tags_cast FOREIGN KEY (cast_id) REFERENCES casts(id) ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE event_cast_tags`);
        await queryRunner.query(`DROP TABLE events`);
        await queryRunner.query(`DROP TYPE event_type_enum`);
    }
}
