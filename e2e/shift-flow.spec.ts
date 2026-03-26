import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

const ADMIN_URL = 'http://localhost:3001';

// 運用データや他テストと衝突しない遠い未来の固定日付
const TEST_DATE = '2099-11-01';

async function login(page: any) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

/**
 * ShiftEditor の DateField に固定日付を入力し、fetchExisting の完了を待つ。
 * MUI DateField はセグメント単位のキーボード入力で日付を受け付けるため、
 * YYYYMMDD を連続入力することで自動的に各セグメントへ振り分けられる。
 */
async function setShiftDate(page: any, date: string) {
    const digits = date.replace(/-/g, ''); // 'YYYY-MM-DD' → 'YYYYMMDD'
    const dateInput = page.getByTestId('shift-date-input');
    await dateInput.click();
    await page.keyboard.press('Control+a');
    // レスポンス受信の監視を先に登録してからキー入力する
    const dateLoadedPromise = page.waitForResponse((res: any) =>
        res.url().includes(`/api/shifts?date=${date}`)
    );
    await page.keyboard.type(digits);
    await dateLoadedPromise;
}

const casts = getTestCasts();
const testCast = casts[0] ?? null;

if (!testCast) {
    test.describe.skip('シフト登録と一覧表示フロー（キャストデータが読み込めません）', () => {
        test('スキップ: キャストデータが読み込めません', () => {});
    });
} else {
    test.describe('シフト登録と一覧表示フロー', () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
            // テスト間の状態干渉を防ぐため、テスト固定日付の夜シフトを事前にクリア
            await page.request.post(`${ADMIN_URL}/api/shifts`, {
                data: { date: TEST_DATE, shift: 'night', castIds: [] },
            });
        });

        test('シフトを登録すると一覧に表示されること', async ({ page }) => {
            // シフト登録ページへ移動（キャスト一覧と既存データの読み込みを待機）
            await Promise.all([
                page.goto(`${ADMIN_URL}/shifts`),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
                page.waitForResponse((res: any) => res.url().includes('/api/shifts?date=')),
            ]);

            // 固定テスト日付を DateField に入力
            await setShiftDate(page, TEST_DATE);

            // キャストの Chip が表示されていることを確認
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await expect(castChip).toBeVisible();

            // キャストを選択
            await castChip.click();

            // 保存ボタンをクリックして POST /api/shifts のレスポンスを待機
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/shifts') &&
                    !resp.url().includes('/api/shifts?') &&
                    !resp.url().includes('/api/shifts/') &&
                    resp.request().method() === 'POST'
                ),
            ]);

            // 保存成功の Snackbar が表示されること
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 一覧テーブルが表示されること
            await expect(page.getByTestId('shift-list')).toBeVisible();

            // 固定テスト日付の夜シフト・選択したキャストの行が存在すること
            const matchingRow = page.getByTestId(`shift-list-row-${TEST_DATE}-night-${testCast.id}`);
            await expect(matchingRow).toBeVisible();
        });

        test('ソースツイートを登録するとリンクが表示され、クリックでダイアログにツイートが表示されること', async ({ page }) => {
            const tweetId = '1954740195934474563';

            // シフト登録ページへ移動（キャスト一覧と既存データの読み込みを待機）
            // fetchExisting のレスポンスまで待つことで、ツイート入力フィールドが
            // fetchExisting によってクリアされるレース条件を回避する
            await Promise.all([
                page.goto(`${ADMIN_URL}/shifts`),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
                page.waitForResponse((res: any) => res.url().includes('/api/shifts?date=')),
            ]);

            // 固定テスト日付を DateField に入力
            await setShiftDate(page, TEST_DATE);

            // ツイート URL を入力してプレビューが出るのを待つ
            await page.getByTestId('shift-tweet-url-input').fill(tweetId);
            await expect(page.getByTestId(`tweet-container-${tweetId}`)).toBeVisible({ timeout: 15000 });

            // キャストを選択
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await castChip.click();

            // 保存
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/shifts') &&
                    !resp.url().includes('/api/shifts?') &&
                    !resp.url().includes('/api/shifts/') &&
                    resp.request().method() === 'POST'
                ),
            ]);
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 登録した行に「ツイートを確認」リンクが表示されること
            const matchingRow = page.getByTestId(`shift-list-row-${TEST_DATE}-night-${testCast.id}`);
            const sourceLink = matchingRow.getByRole('button', { name: 'ツイートを確認' });
            await expect(sourceLink).toBeVisible();

            // リンクをクリックするとダイアログが開くこと
            await sourceLink.click();
            await expect(page.getByTestId('shift-source-dialog')).toBeVisible();

            // ダイアログ内にシフト情報が表示されること
            const dialog = page.getByTestId('shift-source-dialog');
            const shiftInfo = dialog.getByTestId('shift-source-dialog-shift-info');
            await expect(shiftInfo).toContainText(TEST_DATE);
            await expect(shiftInfo).toContainText('夜');
            await expect(shiftInfo).toContainText(testCast.name);

            // ダイアログ内にツイートが表示されること
            await expect(
                dialog.getByTestId(`tweet-container-${tweetId}`)
            ).toBeVisible({ timeout: 15000 });

            // ✕ ボタンで閉じられること
            await page.getByRole('button', { name: '閉じる' }).click();
            await expect(page.getByTestId('shift-source-dialog')).not.toBeVisible();
        });

        test('ソースなしの行に「追加」からツイートを登録できること', async ({ page }) => {
            const tweetId = '1954740195934474563';

            // シフト登録ページへ移動（キャスト一覧と既存データの読み込みを待機）
            await Promise.all([
                page.goto(`${ADMIN_URL}/shifts`),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
                page.waitForResponse((res: any) => res.url().includes('/api/shifts?date=')),
            ]);

            // 固定テスト日付を DateField に入力
            await setShiftDate(page, TEST_DATE);

            // ソースなしでシフトを保存（ツイートURLを入力しない）
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await expect(castChip).toBeVisible();
            await castChip.click();
            await Promise.all([
                page.getByTestId('shift-save-button').click(),
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/shifts') &&
                    !resp.url().includes('/api/shifts?') &&
                    !resp.url().includes('/api/shifts/') &&
                    resp.request().method() === 'POST'
                ),
            ]);
            await expect(page.getByText('保存しました！')).toBeVisible();

            // 登録した行に「追加」リンクが表示されること
            const matchingRow = page.getByTestId(`shift-list-row-${TEST_DATE}-night-${testCast.id}`);
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

            // 「保存する」をクリックして PATCH /api/shifts/source のレスポンスを待機
            await Promise.all([
                addDialog.getByTestId('add-source-save-button').click(),
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/shifts/source') && resp.request().method() === 'PATCH'
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
