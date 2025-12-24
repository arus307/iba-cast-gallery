import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * テスト環境専用: ファンマークのテストデータを設定するマイグレーション
 * 
 * このマイグレーションはE2E_TESTING環境変数がtrueの場合のみ実行されます。
 * 本番環境では絶対に実行されません。
 */
export class SetFanMarksForTesting1766548126765 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // E2E_TESTING環境変数がtrueの場合のみ実行
        if (process.env.E2E_TESTING !== 'true') {
            console.log('Skipping SetFanMarksForTesting migration (E2E_TESTING is not true)');
            return;
        }

        console.log('Running SetFanMarksForTesting migration for E2E testing');

        // テスト用にいくつかのキャストにファンマークを設定
        // メノウ (id: 1) に推しマークを設定
        await queryRunner.query(`
            UPDATE casts 
            SET fan_mark = '🐈‍⬛❤️‍🔥' 
            WHERE id = 1 AND name = 'メノウ'
        `);

        // クジャク (id: 2) に推しマークを設定
        await queryRunner.query(`
            UPDATE casts 
            SET fan_mark = '🦚💜' 
            WHERE id = 2 AND name = 'クジャク'
        `);

        // ルリ (id: 3) に推しマークを設定
        await queryRunner.query(`
            UPDATE casts 
            SET fan_mark = '💎🔵' 
            WHERE id = 3 AND name = 'ルリ'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // E2E_TESTING環境変数がtrueの場合のみ実行
        if (process.env.E2E_TESTING !== 'true') {
            return;
        }

        // ファンマークをデフォルト値に戻す
        await queryRunner.query(`
            UPDATE casts 
            SET fan_mark = '-' 
            WHERE id IN (1, 2, 3)
        `);
    }
}
