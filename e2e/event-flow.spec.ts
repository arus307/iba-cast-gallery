import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

const ADMIN_URL = 'http://localhost:3001';

// 運用データや他テストと衝突しない固定テストタイトル
const TEST_TITLE = '【E2Eテスト】テストイベント';
const TEST_DATE_START = '20991101';
const TEST_DATE_END = '20991103';
const TEST_DATE_START_DISPLAY = '2099/11/01';

async function login(page: any) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

/**
 * DateField にYYYYMMDD形式で日付を入力する。
 * MUI DateField はセグメント単位のキーボード入力を受け付けるため
 * YYYYMMDD を連続入力することで各セグメントへ自動振り分けされる。
 */
async function setEventDate(page: any, testId: string, digits: string) {
    const dateInput = page.getByTestId(testId);
    await dateInput.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(digits);
}

/**
 * テスト用タイトルのイベントをすべて API で削除する（テスト間の状態干渉を防ぐ）
 */
async function cleanupTestEvents(page: any) {
    const res = await page.request.get(`${ADMIN_URL}/api/events`);
    if (!res.ok()) return;
    const events = await res.json();
    for (const ev of events) {
        if (ev.title.startsWith('【E2Eテスト】')) {
            await page.request.delete(`${ADMIN_URL}/api/events/${ev.id}`);
        }
    }
}

const casts = getTestCasts();
const testCast = casts[0] ?? null;

if (!testCast) {
    test.describe.skip('イベント登録・編集・削除フロー（キャストデータが読み込めません）', () => {
        test('スキップ: キャストデータが読み込めません', () => {});
    });
} else {
    test.describe('イベント登録・編集・削除フロー', () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
            await cleanupTestEvents(page);
        });

        test.afterEach(async ({ page }) => {
            await cleanupTestEvents(page);
        });

        test('イベントを登録すると一覧に表示されること', async ({ page }) => {
            // イベント管理ページへ移動
            await Promise.all([
                page.goto(`${ADMIN_URL}/events`),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
            ]);

            // タイトル入力
            await page.getByTestId('event-title-input').fill(TEST_TITLE);

            // 開始日入力
            await setEventDate(page, 'event-date-start-input', TEST_DATE_START);

            // 終了日入力
            await setEventDate(page, 'event-date-end-input', TEST_DATE_END);

            // キャストを選択
            const castChip = page.getByRole('button', { name: testCast.name }).first();
            await expect(castChip).toBeVisible();
            await castChip.click();

            // 登録ボタンをクリックして POST /api/events のレスポンスを待機
            const [res] = await Promise.all([
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/events') &&
                    !resp.url().includes('/api/events/') &&
                    resp.request().method() === 'POST'
                ),
                page.getByTestId('event-save-button').click(),
            ]);
            expect(res.status()).toBe(201);

            // 登録成功の Snackbar が表示されること
            await expect(page.getByText('登録しました！')).toBeVisible();

            // 一覧テーブルが表示されること
            await expect(page.getByTestId('event-list')).toBeVisible();

            // 登録したイベントのタイトルが一覧に表示されること
            await expect(page.getByText(TEST_TITLE)).toBeVisible();

            // 登録したキャスト名が一覧に表示されること
            await expect(page.getByText(testCast.name)).toBeVisible();
        });

        test('イベントを編集できること', async ({ page }) => {
            // 事前にAPIでイベントを登録
            const createRes = await page.request.post(`${ADMIN_URL}/api/events`, {
                data: {
                    eventType: 'cast_event',
                    title: TEST_TITLE,
                    dateStart: '2099-11-01',
                    dateEnd: '2099-11-01',
                    castIds: [],
                },
            });
            expect(createRes.status()).toBe(201);

            // イベント管理ページへ移動
            await Promise.all([
                page.goto(`${ADMIN_URL}/events`),
                page.waitForResponse((res: any) => res.url().includes('/api/events')),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
            ]);

            // 登録したイベントの行が表示されていること
            await expect(page.getByText(TEST_TITLE)).toBeVisible();

            // 編集ボタンをクリック（一覧の対象行）
            const row = page.getByRole('row', { name: new RegExp(TEST_TITLE) });
            await row.getByRole('button', { name: '編集' }).click();

            // フォームにタイトルが反映されること
            await expect(page.getByTestId('event-title-input')).toHaveValue(TEST_TITLE);

            // タイトルを変更
            const updatedTitle = `${TEST_TITLE}（更新済み）`;
            await page.getByTestId('event-title-input').fill(updatedTitle);

            // 更新するボタンをクリックして PUT のレスポンスを待機
            const [res] = await Promise.all([
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/events/') && resp.request().method() === 'PUT'
                ),
                page.getByTestId('event-save-button').click(),
            ]);
            expect(res.status()).toBe(200);

            // 更新成功の Snackbar が表示されること
            await expect(page.getByText('更新しました！')).toBeVisible();

            // 一覧に更新後のタイトルが表示されること
            await expect(page.getByText(updatedTitle)).toBeVisible();

            // 元のタイトルが消えていること
            await expect(page.getByText(TEST_TITLE, { exact: true })).not.toBeVisible();
        });

        test('イベントを削除できること', async ({ page }) => {
            // 事前にAPIでイベントを登録
            const createRes = await page.request.post(`${ADMIN_URL}/api/events`, {
                data: {
                    eventType: 'cast_event',
                    title: TEST_TITLE,
                    dateStart: '2099-11-01',
                    dateEnd: '2099-11-01',
                    castIds: [],
                },
            });
            expect(createRes.status()).toBe(201);

            // イベント管理ページへ移動
            await Promise.all([
                page.goto(`${ADMIN_URL}/events`),
                page.waitForResponse((res: any) => res.url().includes('/api/events')),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
            ]);

            // 登録したイベントの行が表示されていること
            await expect(page.getByText(TEST_TITLE)).toBeVisible();

            // confirm ダイアログを自動承認
            page.on('dialog', (dialog) => dialog.accept());

            // 削除ボタンをクリックして DELETE のレスポンスを待機
            const row = page.getByRole('row', { name: new RegExp(TEST_TITLE) });
            const [res] = await Promise.all([
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/events/') && resp.request().method() === 'DELETE'
                ),
                row.getByRole('button', { name: '削除' }).click(),
            ]);
            expect(res.status()).toBe(200);

            // 削除成功の Snackbar が表示されること
            await expect(page.getByText('削除しました')).toBeVisible();

            // 一覧からイベントが消えていること
            await expect(page.getByText(TEST_TITLE)).not.toBeVisible();
        });

        test('開始日を入力すると一覧に期間が表示されること', async ({ page }) => {
            // イベント管理ページへ移動
            await Promise.all([
                page.goto(`${ADMIN_URL}/events`),
                page.waitForResponse((res: any) => res.url().includes('/api/casts')),
            ]);

            // タイトル・日付を入力
            await page.getByTestId('event-title-input').fill(TEST_TITLE);
            await setEventDate(page, 'event-date-start-input', TEST_DATE_START);
            await setEventDate(page, 'event-date-end-input', TEST_DATE_END);

            // 登録
            await Promise.all([
                page.waitForResponse((resp: any) =>
                    resp.url().includes('/api/events') &&
                    !resp.url().includes('/api/events/') &&
                    resp.request().method() === 'POST'
                ),
                page.getByTestId('event-save-button').click(),
            ]);
            await expect(page.getByText('登録しました！')).toBeVisible();

            // 一覧に期間（dateStart〜dateEnd）が表示されること
            await expect(page.getByText('2099-11-01 〜 2099-11-03')).toBeVisible();
        });
    });
}
