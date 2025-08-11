import { test, expect } from '@playwright/test';

// This is a placeholder for the admin email.
// In the GitHub Actions workflow, this will be set as an environment variable.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'test@example.com';

// Reusable login function
async function login(page: any) {
    await page.request.post('http://localhost:3001/api/auth/e2e-login');
}

test.describe('Tweet Tagger and Gallery Flow', () => {

    // Use a unique tweet ID for each test run to avoid conflicts.
    const tweetId = `1798803393961955328`; // A known valid tweet ID
    const tweetUrl = `http://x.com/i/status/${tweetId}`;

    test('should create a tweet in tagger and see it in the gallery', async ({ page }) => {
        // Log in as admin
        await login(page);

        // Navigate to the tweet tagger home page
        await page.goto('http://localhost:3001/');

        await expect(page.getByText('登録画面')).toBeVisible();

        return;

        // TODO中身修正する
        
        // Fill in the tweet URL
        await page.getByLabel('TweetのURL').fill(tweetUrl);

        // Click the "ツイート情報取得" (Fetch Tweet Info) button
        await page.getByRole('button', { name: 'ツイート情報取得' }).click();

        // Wait for the tweet to be loaded and displayed
        await expect(page.frameLocator('iframe[data-testid="tweet-iframe-0"]').getByText('IbaMichi')).toBeVisible();

        // Select a cast member (tag)
        // This assumes there's a chip with the text "伊波杏樹".
        // We might need to adjust the selector based on the actual UI.
        await page.getByRole('button', { name: '伊波杏樹' }).click();

        // Click the "登録" (Register) button
        await page.getByRole('button', { name: '登録', exact: true }).click();

        // Wait for the success message or navigation
        // For now, let's just wait for a moment. A better way would be to wait for a specific element.
        await page.waitForTimeout(2000);

        // --- Verification in tweet-tagger ---
        // Navigate to the registered posts list
        await page.goto('http://localhost:3001/posts');

        // Verify the new tweet is in the list
        await expect(page.getByText(tweetUrl)).toBeVisible();

        // --- Verification in iba-cast-gallery ---
        // Navigate to the gallery
        await page.goto('http://localhost:3000/');

        // Verify the tweet is displayed in the gallery
        // The tweet might be identified by its content or author.
        // Let's look for the author's name as a starting point.
        await expect(page.frameLocator('iframe[data-testid="tweet-iframe-0"]').getByText('IbaMichi')).toBeVisible();
    });
});
