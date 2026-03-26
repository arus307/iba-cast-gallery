import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

const ADMIN_URL = 'http://localhost:3001';

async function login(page: any) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

/**
 * API 経由でシフトを登録するヘルパー。
 * castIds: [] を渡すと洗い替えによりそのシフトのレコードが全削除される。
 */
async function registerShift(
    page: any,
    date: string,
    shift: string,
    castIds: number[],
) {
    const res = await page.request.post(`${ADMIN_URL}/api/shifts`, {
        data: { date, shift, castIds, sourcePostId: null },
    });
    expect(res.ok()).toBeTruthy();
}

// 運用データと衝突しない遠い未来の固定日付
const DATE_OLD = '2099-12-01';
const DATE_NEW = '2099-12-02'; // DATE_OLD より新しい

const casts = getTestCasts();
const testCast = casts[0] ?? null;

if (!testCast) {
    test.describe.skip('シフト一覧ソート順（キャストデータが読み込めません）', () => {
        test('スキップ: キャストデータが読み込めません', () => {});
    });
} else {
    test.describe('シフト一覧のソート順', () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
            // DATE_OLD に 3 種類のシフトを登録
            await registerShift(page, DATE_OLD, 'open', [testCast!.id]);
            await registerShift(page, DATE_OLD, 'evening', [testCast!.id]);
            await registerShift(page, DATE_OLD, 'night', [testCast!.id]);
            // DATE_NEW（DATE_OLD より新しい日付）に夜シフトを登録
            await registerShift(page, DATE_NEW, 'night', [testCast!.id]);
        });

        test.afterEach(async ({ page }) => {
            // castIds: [] で洗い替えするとレコードが全削除される
            for (const date of [DATE_OLD, DATE_NEW]) {
                for (const shift of ['open', 'evening', 'night']) {
                    await registerShift(page, date, shift, []);
                }
            }
        });

        test('新しい日付のシフトが古い日付より上に表示されること', async ({ page }) => {
            await Promise.all([
                page.goto(`${ADMIN_URL}/shifts`),
                page.waitForResponse((res) => res.url().includes('/api/shifts/list')),
            ]);
            await expect(page.getByTestId('shift-list')).toBeVisible();

            // 登録した行が全て現れるまで待機（data-testid で一意に特定）
            await expect(page.getByTestId(`shift-list-row-${DATE_NEW}-night-${testCast!.id}`)).toBeVisible();
            await expect(page.getByTestId(`shift-list-row-${DATE_OLD}-night-${testCast!.id}`)).toBeVisible();

            const rows = page.locator('[data-testid^="shift-list-row-"]');
            const allTexts = await rows.allTextContents();

            const dateNewFirstIdx = allTexts.findIndex((t) => t.includes(DATE_NEW));
            const dateOldFirstIdx = allTexts.findIndex((t) => t.includes(DATE_OLD));

            expect(dateNewFirstIdx).toBeGreaterThanOrEqual(0);
            expect(dateOldFirstIdx).toBeGreaterThanOrEqual(0);
            // 新しい日付（DATE_NEW）の行が古い日付（DATE_OLD）より上にあること
            expect(dateNewFirstIdx).toBeLessThan(dateOldFirstIdx);
        });

        test('同じ日付内で夜→夕方→オープンの順に表示されること', async ({ page }) => {
            await Promise.all([
                page.goto(`${ADMIN_URL}/shifts`),
                page.waitForResponse((res) => res.url().includes('/api/shifts/list')),
            ]);
            await expect(page.getByTestId('shift-list')).toBeVisible();

            // 3 種類のシフトが全て表示されるまで待機（data-testid で一意に特定してstrict違反を回避）
            await expect(page.getByTestId(`shift-list-row-${DATE_OLD}-night-${testCast!.id}`)).toBeVisible();
            await expect(page.getByTestId(`shift-list-row-${DATE_OLD}-evening-${testCast!.id}`)).toBeVisible();
            await expect(page.getByTestId(`shift-list-row-${DATE_OLD}-open-${testCast!.id}`)).toBeVisible();

            const rows = page.locator('[data-testid^="shift-list-row-"]');
            const allTexts = await rows.allTextContents();

            const nightIdx   = allTexts.findIndex((t) => t.includes(DATE_OLD) && t.includes('夜'));
            const eveningIdx = allTexts.findIndex((t) => t.includes(DATE_OLD) && t.includes('夕方'));
            const openIdx    = allTexts.findIndex((t) => t.includes(DATE_OLD) && t.includes('オープン'));

            expect(nightIdx).toBeGreaterThanOrEqual(0);
            expect(eveningIdx).toBeGreaterThanOrEqual(0);
            expect(openIdx).toBeGreaterThanOrEqual(0);

            // 夜 → 夕方 → オープン の順
            expect(nightIdx).toBeLessThan(eveningIdx);
            expect(eveningIdx).toBeLessThan(openIdx);
        });
    });
}
