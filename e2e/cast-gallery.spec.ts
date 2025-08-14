import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

// テストデータを読み込む
const casts = getTestCasts();

test.describe('ギャラリーのキャスト個人ページ', () => {
    // キャストデータが取得できているか確認
    if (casts.length === 0) {
        test('キャストデータが取得できないため、テストをスキップします', () => {
            console.error('Cast data is empty. Skipping tests.');
            test.skip(true, 'Cast data could not be loaded.');
        });
        return;
    }

    // 取得したキャストリストに基づいて動的にテストを生成
    for (const cast of casts) {
        test(`キャスト「${cast.name}」のページが正しく表示される`, async ({ page }) => {
            await page.goto(`http://localhost:3000/casts/${cast.enName}`);

            // 1. キャスト名が表示されていることを確認
            const castNameElement = page.getByTestId('cast-name');
            await expect(castNameElement, `キャスト名「${cast.name}」が表示されていること`).toBeVisible();
            await expect(castNameElement, `キャスト名「${cast.name}」のテキストが正しいこと`).toContainText(cast.name);

            // 2. 自己紹介ツイートが表示されていることを確認
            if (cast.introduceTweetId) {
                const introduceTweetAccordion = page.getByTestId('introduce-tweet-accordion');
                await expect(introduceTweetAccordion, '自己紹介ツイートのセクションが表示されていること').toBeVisible();

                const introduceTweet = introduceTweetAccordion.getByTestId('introduce-tweet');
                await expect(introduceTweet, '自己紹介ツイートのコンポーネントが表示されていること').toBeVisible();

                // 3. ツイートの読み込みが完了するまで待つ (スケルトンが消えるまで)
                const tweetSkeleton = introduceTweet.getByTestId('tweet-skeleton');
                await expect(tweetSkeleton, 'ツイートのスケルトンが非表示になること').not.toBeVisible({ timeout: 15000 });

                // 4. ツイートが見つからないエラーが表示されていないことを確認
                const tweetNotFound = introduceTweet.getByTestId('tweet-not-found');
                await expect(tweetNotFound, '「ツイートが見つかりません」のエラーが表示されていないこと').not.toBeVisible();
            }
        });
    }
if (casts.length === 0) {
    test.describe.skip('ギャラリーのキャスト個人ページ', 'Cast data could not be loaded. Skipping all tests.');
} else {
    test.describe('ギャラリーのキャスト個人ページ', () => {
        // 取得したキャストリストに基づいて動的にテストを生成
        for (const cast of casts) {
            test(`キャスト「${cast.name}」のページが正しく表示される`, async ({ page }) => {
                await page.goto(`http://localhost:3000/casts/${cast.enName}`);

                // 1. キャスト名が表示されていることを確認
                const castNameElement = page.getByTestId('cast-name');
                await expect(castNameElement, `キャスト名「${cast.name}」が表示されていること`).toBeVisible();
                await expect(castNameElement, `キャスト名「${cast.name}」のテキストが正しいこと`).toContainText(cast.name);

                // 2. 自己紹介ツイートが表示されていることを確認
                if (cast.introduceTweetId) {
                    const introduceTweetAccordion = page.getByTestId('introduce-tweet-accordion');
                    await expect(introduceTweetAccordion, '自己紹介ツイートのセクションが表示されていること').toBeVisible();

                    const introduceTweet = introduceTweetAccordion.getByTestId('introduce-tweet');
                    await expect(introduceTweet, '自己紹介ツイートのコンポーネントが表示されていること').toBeVisible();

                    // 3. ツイートの読み込みが完了するまで待つ (スケルトンが消えるまで)
                    const tweetSkeleton = introduceTweet.getByTestId('tweet-skeleton');
                    await expect(tweetSkeleton, 'ツイートのスケルトンが非表示になること').not.toBeVisible({ timeout: 15000 });

                    // 4. ツイートが見つからないエラーが表示されていないことを確認
                    const tweetNotFound = introduceTweet.getByTestId('tweet-not-found');
                    await expect(tweetNotFound, '「ツイートが見つかりません」のエラーが表示されていないこと').not.toBeVisible();
                }
            });
        }
    });
}
