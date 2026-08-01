import { expect, test } from "@playwright/test";
import { getTestCasts } from "./lib/test-data";

const ADMIN_URL = "http://localhost:3001";
const GALLERY_URL = "http://localhost:3000";
const BLOG_POST_ID = "11647688710085046272";

const casts = getTestCasts();
const taggedCast = casts[0] ?? null;

if (!taggedCast) {
    test.describe.skip("BLOGポスト登録（キャストデータなし）", () => {
        test("スキップ", () => {});
    });
} else {
    test.describe("BLOGポスト登録と公開表示", () => {
        test.beforeEach(async ({ page }) => {
            await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
            await page.request.delete(`${ADMIN_URL}/api/posts/${BLOG_POST_ID}`);
        });

        test.afterEach(async ({ page }) => {
            await page.request.delete(`${ADMIN_URL}/api/posts/${BLOG_POST_ID}`);
        });

        test("BLOGとして登録したポストをギャラリーから分離し、キャスト詳細で表示する", async ({
            page,
        }) => {
            await Promise.all([
                page.goto(ADMIN_URL),
                page.waitForResponse((response) =>
                    response.url().includes("/api/casts"),
                ),
            ]);
            await page.getByTestId("tweet-id-input").fill(BLOG_POST_ID);
            await page.getByTestId("gallery-destination-checkbox").uncheck();
            await page.getByTestId("blog-destination-checkbox").check();
            await expect(page.getByTestId("blog-post-preview")).toBeVisible();

            const castPicker = page.getByRole("combobox", {
                name: "タグ付けするキャストを選択",
            });
            await castPicker.fill(taggedCast.name);
            await page.getByRole("option", { name: taggedCast.name }).click();

            const saveResponse = page.waitForResponse(
                (response) =>
                    response.url() === `${ADMIN_URL}/api/post-registrations` &&
                    response.request().method() === "POST",
            );
            await page.getByTestId("tweet-register-button").click();
            expect((await saveResponse).status()).toBe(201);

            const postResponse = await page.request.get(
                `${ADMIN_URL}/api/posts/${BLOG_POST_ID}`,
            );
            expect(postResponse.ok()).toBeTruthy();
            const post = await postResponse.json();
            expect(post.contentType).toBe("blog");
            expect(post.showInGallery).toBe(true);
            expect(post.castTags.map((tag: { castid: number }) => tag.castid)).toEqual([
                taggedCast.id,
            ]);

            await page.goto(`${GALLERY_URL}/blog`);
            await expect(
                page.getByTestId(`blog-post-card-${BLOG_POST_ID}`),
            ).toBeVisible();

            await page.goto(`${GALLERY_URL}/casts/${taggedCast.enName}`);
            await page.getByRole("tab", { name: /BLOG/ }).click();
            await expect(
                page.getByTestId(`blog-post-card-${BLOG_POST_ID}`),
            ).toBeVisible();
        });

        test("BLOGとシフトは同時に選択できない", async ({ page }) => {
            await Promise.all([
                page.goto(ADMIN_URL),
                page.waitForResponse((response) =>
                    response.url().includes("/api/casts"),
                ),
            ]);
            const blogDestination = page.getByTestId(
                "blog-destination-checkbox",
            );
            const shiftDestination = page.getByTestId(
                "shift-destination-checkbox",
            );

            await blogDestination.check();
            await expect(blogDestination).toBeChecked();
            await expect(shiftDestination).not.toBeChecked();

            await shiftDestination.check();
            await expect(shiftDestination).toBeChecked();
            await expect(blogDestination).not.toBeChecked();

            await blogDestination.check();
            await expect(blogDestination).toBeChecked();
            await expect(shiftDestination).not.toBeChecked();
        });

        test("BLOGとシフトの同時登録リクエストを拒否する", async ({
            page,
        }) => {
            const response = await page.request.post(
                `${ADMIN_URL}/api/post-registrations`,
                {
                    data: {
                        postId: BLOG_POST_ID,
                        destinations: { gallery: false, blog: true, shift: true },
                        taggedCastIds: [taggedCast.id],
                        shiftCastIds: [taggedCast.id],
                    },
                },
            );

            expect(response.status()).toBe(400);
            expect(await response.json()).toEqual({
                error: "BLOGとシフトを同時には登録できません",
            });
        });
    });
}
