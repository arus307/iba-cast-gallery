import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const ADMIN_URL = "http://localhost:3001";
const INTRODUCE_POST_ID = "2999999999999999910";

async function login(page: Page) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

test.describe("キャスト登録画面", () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test("入力したキャスト情報を登録APIへ送信できること", async ({ page }) => {
        let requestBody: Record<string, unknown> | null = null;
        await page.route("**/api/casts", async (route) => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }

            requestBody = route.request().postDataJSON();
            await route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({ id: 999, ...requestBody }),
            });
        });

        await page.goto(`${ADMIN_URL}/casts`);
        await expect(page.getByRole("heading", { name: "キャスト登録" })).toBeVisible();

        await page.getByTestId("cast-name-input").fill("E2Eテストキャスト");
        await page.getByTestId("cast-en-name-input").fill("e2e-test-cast");
        await page.getByLabel("種別").click();
        await page.getByRole("option", { name: "イマジナリーキャスト (IC)" }).click();
        await page.getByTestId("cast-introduce-post-input").fill(
            `https://x.com/imaginary_base/status/${INTRODUCE_POST_ID}`,
        );
        await page.getByTestId("cast-fan-mark-input").fill("🧪");

        await expect(page.getByTestId("cast-save-button")).toBeEnabled();
        await page.getByTestId("cast-save-button").click();

        await expect(page.getByText("キャストを登録しました！")).toBeVisible();
        expect(requestBody).toEqual({
            name: "E2Eテストキャスト",
            enName: "e2e-test-cast",
            introduceTweetId: INTRODUCE_POST_ID,
            type: 2,
            isActive: true,
            fanMark: "🧪",
        });
        await expect(page.getByTestId("cast-name-input")).toHaveValue("");
    });

    test("紹介ポストが不正な場合は登録できないこと", async ({ page }) => {
        await page.goto(`${ADMIN_URL}/casts`);

        await page.getByTestId("cast-name-input").fill("E2Eテストキャスト");
        await page.getByTestId("cast-en-name-input").fill("e2e-test-cast");
        await page.getByTestId("cast-introduce-post-input").fill("not-an-x-post");

        await expect(
            page.getByText("XのポストURLまたはポストIDを入力してください"),
        ).toBeVisible();
        await expect(page.getByTestId("cast-save-button")).toBeDisabled();
    });
});
