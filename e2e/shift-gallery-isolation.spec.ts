import { test, expect } from '@playwright/test';
import { getTestCasts } from './lib/test-data';

/**
 * シフトソースとギャラリー登録の分離テスト
 *
 * 確認する挙動:
 * 1. シフトソースとして登録したツイートは showInGallery=false になり、
 *    ギャラリーに表示されない。
 * 2. 先にギャラリー登録されたツイートをシフトソースに設定しても、
 *    showInGallery は変わらずギャラリーに表示されたまま。
 */

async function login(page: any) {
    await page.request.post('http://localhost:3001/api/auth/e2e-login');
}

const casts = getTestCasts();
const testCast = casts[0] ?? null;

// テスト専用のツイートID（他テストと衝突しない未来日付と合わせて使用）
// ランの紹介ツイート ID - posts テーブルには存在しないが実在するツイート
const SHIFT_ONLY_TWEET_ID = '1912083488758792543';
// shift-flow.spec.ts の tweetId と衝突しないよう、このテスト専用のフェイク ID を使用
// ギャラリーは showInGallery=true であれば実在しない ID でも表示する
const GALLERY_TWEET_ID = '1900000000000000099';

if (!testCast) {
    test.describe.skip('シフト・ギャラリー分離テスト（キャストデータが読み込めません）', () => {
        test('スキップ: キャストデータが読み込めません', () => {});
    });
} else {
    test.describe('シフト・ギャラリー分離テスト', () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
        });

        test('シフトソースとして登録したツイートはギャラリーに表示されないこと', async ({ page }) => {
            // API を直接叩いてシフトソース付きのシフトを登録
            // （showInGallery=false で posts テーブルに挿入される）
            const res = await page.request.post('http://localhost:3001/api/shifts', {
                data: {
                    date: '2099-01-01',
                    shift: 'night',
                    castIds: [testCast.id],
                    sourcePostId: SHIFT_ONLY_TWEET_ID,
                },
            });
            expect(res.ok()).toBeTruthy();

            // ギャラリーを開く
            await page.goto('http://localhost:3000');

            // シフトソース専用ツイートがギャラリーに表示されていないこと
            await expect(
                page.getByTestId(`tweet-container-${SHIFT_ONLY_TWEET_ID}`)
            ).not.toBeVisible();
        });

        test('ギャラリー登録済みのツイートをシフトソースに登録してもギャラリーに表示されたままであること', async ({ page }) => {
            // ① ギャラリー向け通常ポストとして登録（showInGallery=true）
            const registerRes = await page.request.post('http://localhost:3001/api/posts', {
                data: {
                    post: {
                        id: GALLERY_TWEET_ID,
                        postedAt: new Date().toISOString(),
                        isDeleted: false,
                        showInGallery: true,
                        shiftSource: null,
                        castTags: [],
                        taggedCasts: [],
                        favorites: [],
                    },
                },
            });
            expect(registerRes.ok()).toBeTruthy();

            // ② 同じツイートをシフトソースとして登録
            // → 既存ポストは showInGallery を変えない（saveShifts の仕様）
            const shiftRes = await page.request.post('http://localhost:3001/api/shifts', {
                data: {
                    date: '2099-01-02',
                    shift: 'night',
                    castIds: [testCast.id],
                    sourcePostId: GALLERY_TWEET_ID,
                },
            });
            expect(shiftRes.ok()).toBeTruthy();

            // ギャラリーを開く
            await page.goto('http://localhost:3000');

            // ギャラリー登録されたツイートは引き続き表示されること
            await expect(
                page.getByTestId(`tweet-container-${GALLERY_TWEET_ID}`)
            ).toBeVisible();
        });
    });
}
