import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

// テストデータを読み込む
const casts = getTestCasts();

// ファンマークが設定されているキャストのマッピング
// (テスト専用マイグレーション 1766548126765-SetFanMarksForTesting.ts で設定)
const castsWithFanMarks = new Map([
    ['メノウ', '🐈‍⬛❤️‍🔥'],
    ['クジャク', '🦚💜'],
    ['ルリ', '💎🔵'],
]);

if (casts.length === 0) {
    test.describe.skip('ファンマーク表示機能(キャストデータが読み込めません)', () => {});
} else {
    test.describe('ファンマーク表示機能', () => {
        test.describe('ファンマークが設定されているキャスト', () => {
            // ファンマークが設定されているキャストに対してテストを実行
            for (const cast of casts) {
                const expectedFanMark = castsWithFanMarks.get(cast.name);
                if (expectedFanMark) {
                    test(`キャスト「${cast.name}」のページにファンマーク「${expectedFanMark}」が表示される`, async ({ page }) => {
                        await page.goto(`http://localhost:3000/casts/${cast.enName}`);

                        // 1. キャスト名が表示されていることを確認
                        const castNameElement = page.getByTestId('cast-name');
                        await expect(castNameElement, `キャスト名「${cast.name}」が表示されていること`).toBeVisible();

                        // 2. ファンマークが表示されていることを確認
                        const fanMarkElement = page.getByTestId('fan-mark');
                        await expect(fanMarkElement, `ファンマークが表示されていること`).toBeVisible();

                        // 3. ファンマークのテキストが正しいことを確認
                        await expect(fanMarkElement, `ファンマークのテキストが「${expectedFanMark}」であること`).toContainText(expectedFanMark);

                        // 4. ファンマークがリンクであることを確認
                        const fanMarkLink = fanMarkElement.locator('a');
                        await expect(fanMarkLink, 'ファンマークがリンクであること').toBeVisible();

                        // 5. リンク先が公式ツイートであることを確認
                        const href = await fanMarkLink.getAttribute('href');
                        expect(href, 'リンク先が公式の推しマーク一覧ツイートであること').toBe('https://x.com/iba_diary/status/1980613318734938476');

                        // 6. リンクが新しいタブで開くことを確認
                        const target = await fanMarkLink.getAttribute('target');
                        expect(target, 'リンクが新しいタブで開くこと').toBe('_blank');

                        // 7. セキュリティ属性が設定されていることを確認
                        const rel = await fanMarkLink.getAttribute('rel');
                        expect(rel, 'rel属性にnoopener noreferrerが設定されていること').toContain('noopener');
                        expect(rel, 'rel属性にnoopener noreferrerが設定されていること').toContain('noreferrer');
                    });
                }
            }
        });

        test.describe('ファンマークが設定されていないキャスト', () => {
            // ファンマークが設定されていないキャストに対してテストを実行
            const castsWithoutFanMarks = casts.filter(cast => !castsWithFanMarks.has(cast.name));
            
            if (castsWithoutFanMarks.length > 0) {
                // 最初の3件のキャストでテスト (全キャストでテストすると時間がかかりすぎる)
                const testCasts = castsWithoutFanMarks.slice(0, 3);
                
                for (const cast of testCasts) {
                    test(`キャスト「${cast.name}」のページにファンマークが表示されない`, async ({ page }) => {
                        await page.goto(`http://localhost:3000/casts/${cast.enName}`);

                        // 1. キャスト名が表示されていることを確認
                        const castNameElement = page.getByTestId('cast-name');
                        await expect(castNameElement, `キャスト名「${cast.name}」が表示されていること`).toBeVisible();

                        // 2. ファンマークが表示されていないことを確認 (fanMark が '-' の場合は非表示)
                        const fanMarkElement = page.getByTestId('fan-mark');
                        await expect(fanMarkElement, 'ファンマークが表示されていないこと').not.toBeVisible();
                    });
                }
            }
        });
    });
}
