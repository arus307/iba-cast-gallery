import { test, expect } from '@playwright/test';

// This is a placeholder for the admin email.
// In the GitHub Actions workflow, this will be set as an environment variable.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';

// Reusable login function
async function login(page: any) {
    await page.request.post('http://localhost:3001/api/auth/e2e-login');
}

test.describe('Tweet Tagger and Gallery Flow', () => {
    // 登録するツイートID
    const tweetId = `1954740195934474563`;
    const tweetUrl = `http://x.com/i/status/${tweetId}`;

    test.beforeEach(async ({page})=>{
        await login(page);
    })

    test('管理画面から登録したポストがギャラリーに表示されること', async ({ page }) => {

        // 管理画面を開く

        await Promise.all([
            page.goto('http://localhost:3001/'),
            page.waitForRequest('http://localhost:3001/api/casts'),
        ]);

        await expect(page.getByText('登録画面')).toBeVisible();

        //  キャスト候補の読み込み待機

        await page.getByTestId('tweet-id-input').fill(tweetId);


        // 読み込まれる
        await expect(page.getByTestId(`tweet-container-${tweetId}`)).toBeVisible();

        await page.getByTestId('cast-autocomplete').click();
        const listbox = page.locator('#cast-autocomplete-listbox');
        await listbox.getByText('メノウ').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('リシア').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('ベリル').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('シトリン').click();

        await page.getByTestId('add-tag-button').click();

        const tags = await page.locator('[data-testid^="cast-tag-"]');
        await expect(tags).toHaveCount(4);

        await expect(page.getByTestId('cast-tag-1')).toHaveText('1 メノウ');
        await expect(page.getByTestId('cast-tag-2')).toHaveText('2 リシア');
        await expect(page.getByTestId('cast-tag-3')).toHaveText('3 ベリル');
        await expect(page.getByTestId('cast-tag-4')).toHaveText('4 シトリン');

        // 登録ボタンを押して登録のPOSTリクエストを待機
        Promise.all([
            page.getByTestId('tweet-register-button').click(),
            page.waitForRequest(request => request.url() === 'http://localhost:3001/api/posts' && request.method() === 'POST')
        ]);

        await expect(page.getByTestId('tweet-id-input')).toBeEmpty();

        await page.goto('http://localhost:3001/posts');

        const tweetListItem1 = page.getByTestId('tweet-list-item-1');
        await expect(tweetListItem1).toBeVisible();

        const tweetContainer= tweetListItem1.getByTestId(`tweet-container-${tweetId}`);
        await expect(tweetContainer).toBeVisible();

        await expect(tweetContainer.getByTestId('cast-tag-1')).toHaveText('メノウ');
        await expect(tweetContainer.getByTestId('cast-tag-2')).toHaveText('リシア');
        await expect(tweetContainer.getByTestId('cast-tag-3')).toHaveText('ベリル');
        await expect(tweetContainer.getByTestId('cast-tag-4')).toHaveText('シトリン');

        return;

        // TODO ギャラリー側を追加する
        

        // --- Verification in iba-cast-gallery ---
        // Navigate to the gallery
        await page.goto('http://localhost:3000/');

        // Verify the tweet is displayed in the gallery
        // The tweet might be identified by its content or author.
        // Let's look for the author's name as a starting point.
        await expect(page.frameLocator('iframe[data-testid="tweet-iframe-0"]').getByText('IbaMichi')).toBeVisible();
    });
});
