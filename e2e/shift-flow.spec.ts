import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

async function login(page: any) {
    await page.request.post('http://localhost:3001/api/auth/e2e-login');
}

const casts = getTestCasts();
const testCast = casts.find((c) => c.isActive) ?? null;

if (!testCast) {
    test.describe.skip('シフト登録と一覧表示フロー（キャストデータが読み込めません）', () => {});
} else {
    test.describe('シフト登録と一覧表示フロー', () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
        });

        test('シフトを登録すると一覧に表示されること', async ({ page }) => {
            // シフト登録ページへ移動（キャスト一覧の読み込みを待機）
            await Promise.all([
                page.goto('http://localhost:3001/shifts'),
                page.waitForRequest('http://localhost:3001/api/casts'),
            ]);

            // キャストの Chip が表示されていることを確認
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await expect(castChip).toBeVisible();

            // キャストを選択
            await castChip.click();

            // 保存ボタンをクリックして POST /api/shifts を待機
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForRequest((req) =>
                    req.url().includes('/api/shifts') && req.method() === 'POST'
                ),
            ]);

            // 保存成功の Snackbar が表示されること
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 一覧テーブルが表示されること
            await expect(page.getByTestId('shift-list')).toBeVisible();

            // 夜シフト・選択したキャストを含む行が存在すること
            const matchingRow = page
                .locator('[data-testid^="shift-list-row-"]')
                .filter({ hasText: '夜' })
                .filter({ hasText: testCast.name });
            await expect(matchingRow.first()).toBeVisible();
        });

        test('ソースツイートを登録するとリンクが表示され、クリックでダイアログにツイートが表示されること', async ({ page }) => {
            const tweetId = '1954740195934474563';

            // シフト登録ページへ移動
            await Promise.all([
                page.goto('http://localhost:3001/shifts'),
                page.waitForRequest('http://localhost:3001/api/casts'),
            ]);

            // ツイート URL を入力してプレビューが出るのを待つ
            await page.getByTestId('shift-tweet-url-input').fill(tweetId);
            await expect(page.getByTestId(`tweet-container-${tweetId}`)).toBeVisible({ timeout: 15000 });

            // キャストを選択
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await castChip.click();

            // 保存
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForRequest((req) =>
                    req.url().includes('/api/shifts') && req.method() === 'POST'
                ),
            ]);
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 登録した行に「ツイートを確認」リンクが表示されること
            const matchingRow = page
                .locator('[data-testid^="shift-list-row-"]')
                .filter({ hasText: '夜' })
                .filter({ hasText: testCast.name });
            const sourceLink = matchingRow.getByRole('button', { name: 'ツイートを確認' });
            await expect(sourceLink).toBeVisible();

            // リンクをクリックするとダイアログが開くこと
            await sourceLink.click();
            await expect(page.getByTestId('shift-source-dialog')).toBeVisible();

            // ダイアログ内にツイートが表示されること
            const dialog = page.getByTestId('shift-source-dialog');
            await expect(
                dialog.getByTestId(`tweet-container-${tweetId}`)
            ).toBeVisible({ timeout: 15000 });

            // ✕ ボタンで閉じられること
            await page.getByRole('button', { name: '閉じる' }).click();
            await expect(page.getByTestId('shift-source-dialog')).not.toBeVisible();
        });

        test('ソースなしの行に「追加」からツイートを登録できること', async ({ page }) => {
            const tweetId = '1954740195934474563';

            // シフト登録ページへ移動
            await Promise.all([
                page.goto('http://localhost:3001/shifts'),
                page.waitForRequest('http://localhost:3001/api/casts'),
            ]);

            // ソースなしでシフトを保存（ツイートURLを入力しない）
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await expect(castChip).toBeVisible();
            await castChip.click();
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForRequest((req) =>
                    req.url().includes('/api/shifts') && req.method() === 'POST'
                ),
            ]);
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 登録した行に「追加」リンクが表示されること
            const matchingRow = page
                .locator('[data-testid^="shift-list-row-"]')
                .filter({ hasText: '夜' })
                .filter({ hasText: testCast.name });
            const addSourceLink = matchingRow.getByRole('button', { name: '追加' });
            await expect(addSourceLink).toBeVisible();

            // 「追加」をクリックするとソース追加ダイアログが開くこと
            await addSourceLink.click();
            const addDialog = page.getByTestId('shift-add-source-dialog');
            await expect(addDialog).toBeVisible();

            // ダイアログにツイートIDを入力するとプレビューが表示されること
            await addDialog.getByTestId('add-source-tweet-input').fill(tweetId);
            await expect(
                addDialog.getByTestId(`tweet-container-${tweetId}`)
            ).toBeVisible({ timeout: 15000 });

            // 「保存する」をクリックして PATCH /api/shifts/source を待機
            await Promise.all([
                addDialog.getByTestId('add-source-save-button').click(),
                page.waitForRequest((req) =>
                    req.url().includes('/api/shifts/source') && req.method() === 'PATCH'
                ),
            ]);

            // 保存成功の Snackbar が表示されること
            await expect(page.getByText('ソースを保存しました！')).toBeVisible();

            // ダイアログが閉じること
            await expect(addDialog).not.toBeVisible();

            // 同じ行が「追加」から「ツイートを確認」に切り替わること
            await expect(matchingRow.getByRole('button', { name: 'ツイートを確認' })).toBeVisible();
            await expect(matchingRow.getByRole('button', { name: '追加' })).not.toBeVisible();
        });
    });
}
