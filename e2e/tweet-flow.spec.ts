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
    const tweetId = `1346889436626259968`;
    const tweetUrl = `http://x.com/i/status/${tweetId}`;

    test.beforeEach(async ({page})=>{
        await login(page);
    })

    test('管理画面から登録したポストがギャラリーに表示されること', async ({ page }) => {
        await page.request.delete(`http://localhost:3001/api/posts/${tweetId}`);

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

        const castAutocomplete = page.getByRole('combobox', { name: '写ってるキャストを選択' });
        await castAutocomplete.fill('めのう');
        const listbox = page.locator('#cast-autocomplete-listbox');
        await expect(listbox.getByText('メノウ')).toBeVisible();
        await listbox.getByText('メノウ').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('リシア').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('ベリル').click();

        await page.getByTestId('cast-autocomplete').click();
        await listbox.getByText('シトリン').click();

        const tags = page.locator(
            '[data-testid^="cast-autocomplete-selected-"]:not([data-testid="cast-autocomplete-selected-list"])'
        );
        await expect(tags).toHaveCount(4);

        await expect(page.getByTestId('cast-autocomplete-selected-1')).toHaveText('1 メノウ');
        await expect(page.getByTestId('cast-autocomplete-selected-2')).toHaveText('2 リシア');
        await expect(page.getByTestId('cast-autocomplete-selected-3')).toHaveText('3 ベリル');
        await expect(page.getByTestId('cast-autocomplete-selected-4')).toHaveText('4 シトリン');

        // 登録ボタンを押して登録のPOSTリクエストを待機
        const [, registerRequest] = await Promise.all([
            page.getByTestId('tweet-register-button').click(),
            page.waitForRequest(request => request.url() === 'http://localhost:3001/api/post-registrations' && request.method() === 'POST')
        ]);
        expect(registerRequest.postDataJSON().postedAt).toBe('2021-01-06T18:40:40.344Z');

        await expect(page.getByTestId('tweet-id-input')).toBeEmpty();

        await page.goto('http://localhost:3001/posts');

        const tweetContainer = page.getByTestId(`tweet-container-${tweetId}`);
        await expect(tweetContainer).toBeVisible();

        await expect(tweetContainer.getByTestId('cast-tag-1')).toHaveText('メノウ');
        await expect(tweetContainer.getByTestId('cast-tag-2')).toHaveText('リシア');
        await expect(tweetContainer.getByTestId('cast-tag-3')).toHaveText('ベリル');
        await expect(tweetContainer.getByTestId('cast-tag-4')).toHaveText('シトリン');


        // ギャラリー側でも表示されていることを検証する
        await page.goto('http://localhost:3000');
        const tweetContainerInGallery = page.getByTestId(`tweet-container-${tweetId}`);
        await expect(tweetContainerInGallery).toBeVisible();

        await expect(tweetContainerInGallery.getByTestId('cast-tag-1')).toHaveText('メノウ');
        await expect(tweetContainerInGallery.getByTestId('cast-tag-2')).toHaveText('リシア');
        await expect(tweetContainerInGallery.getByTestId('cast-tag-3')).toHaveText('ベリル');
        await expect(tweetContainerInGallery.getByTestId('cast-tag-4')).toHaveText('シトリン');
    });


    // TODO 個人ページ表示はメニューから遷移する形のほうが良さそう
    // const casts:{
    //     name:string;
    //     enName:string;
    // }[] = [
    //     {
    //         name:'メノウ',
    //         enName:'menou',
    //     },
    //     {
    //         name:'スズ',
    //         enName:'suzu',
    //     }
    // ]

    // for(const {name,enName} of casts ){

    //     test(`個人ページが表示可能なこと - ${enName}`, async({page})=>{
    //         await page.goto(`http://localhost:3000/casts/${enName}`);
    //         await expect(page.getByText(name)).toBeVisible();
    //     });

    // }

});
