import { expect, test } from "@playwright/test";
import { getTestCasts } from "./lib/test-data";
import { inferShiftFromPostedAt } from "../app/tweet-tagger/src/utils/shift";

const ADMIN_URL = "http://localhost:3001";
const GALLERY_URL = "http://localhost:3000";
const COMBINED_POST_ID = "11646878510085046272";
const SHIFT_ONLY_POST_ID = "11647271096939446272";
const COMBINED_DATE = "2098-11-01";
const SHIFT_ONLY_DATE = "2098-11-02";

async function login(page: any) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

async function clearRegistration(
    page: any,
    postId: string,
    date: string,
    slot: "open" | "evening" | "night",
) {
    await page.request.post(`${ADMIN_URL}/api/shifts`, {
        data: { date, shift: slot, castIds: [] },
    });
    await page.request.delete(`${ADMIN_URL}/api/posts/${postId}`);
}

async function selectCast(page: any, label: string, castName: string) {
    const autocomplete = page.getByRole("combobox", { name: label });
    await autocomplete.fill(castName);
    await page.getByRole("option", { name: castName }).click();
}

test.describe("投稿時刻からのシフト自動判定", () => {
    test("日本時間の境界でシフト枠を切り替える", () => {
        expect(
            inferShiftFromPostedAt("2026-07-01T16:29:59+09:00"),
        ).toEqual({ date: "2026-07-01", slot: "open" });
        expect(
            inferShiftFromPostedAt("2026-07-01T16:30:00+09:00"),
        ).toEqual({ date: "2026-07-01", slot: "evening" });
        expect(
            inferShiftFromPostedAt("2026-07-01T18:29:59+09:00"),
        ).toEqual({ date: "2026-07-01", slot: "evening" });
        expect(
            inferShiftFromPostedAt("2026-07-01T18:30:00+09:00"),
        ).toEqual({ date: "2026-07-01", slot: "night" });
    });
});

const casts = getTestCasts();
const taggedCast = casts[0] ?? null;
const boardOnlyCast = casts[1] ?? null;

if (!taggedCast || !boardOnlyCast) {
    test.describe.skip("ポスト・シフト統合登録（キャストデータなし）", () => {
        test("スキップ", () => {});
    });
} else {
    test.describe("ポスト・シフト統合登録", () => {
        test.beforeEach(async ({ page }) => {
            await login(page);
            await clearRegistration(
                page,
                COMBINED_POST_ID,
                COMBINED_DATE,
                "evening",
            );
            await clearRegistration(
                page,
                SHIFT_ONLY_POST_ID,
                SHIFT_ONLY_DATE,
                "night",
            );
        });

        test.afterEach(async ({ page }) => {
            await clearRegistration(
                page,
                COMBINED_POST_ID,
                COMBINED_DATE,
                "evening",
            );
            await clearRegistration(
                page,
                SHIFT_ONLY_POST_ID,
                SHIFT_ONLY_DATE,
                "night",
            );
        });

        test("写真タグを出勤キャストへ自動追加し、ボードのみのキャストも一緒に登録できる", async ({
            page,
        }) => {
            await Promise.all([
                page.goto(ADMIN_URL),
                page.waitForResponse((response: any) =>
                    response.url().includes("/api/casts"),
                ),
            ]);
            await page.getByTestId("tweet-id-input").fill(COMBINED_POST_ID);
            await page.getByTestId("shift-destination-checkbox").check();

            await expect(
                page.getByTestId("registration-shift-slot-evening"),
            ).toHaveAttribute("aria-pressed", "true");

            await selectCast(
                page,
                "写ってるキャストを選択",
                taggedCast.name,
            );
            const shiftPicker = page.getByTestId(
                "shift-cast-autocomplete",
            );
            await expect(
                shiftPicker.getByText(`${taggedCast.name}（写真タグ）`),
            ).toBeVisible();

            await selectCast(
                page,
                "出勤中のキャストを選択",
                boardOnlyCast.name,
            );
            await expect(
                shiftPicker.getByText(boardOnlyCast.name, { exact: true }),
            ).toBeVisible();

            const responsePromise = page.waitForResponse(
                (response) =>
                    response.url() ===
                        `${ADMIN_URL}/api/post-registrations` &&
                    response.request().method() === "POST",
            );
            await page.getByTestId("tweet-register-button").click();
            const response = await responsePromise;
            expect(response.status()).toBe(201);

            const request = response.request().postDataJSON();
            expect(request.taggedCastIds).toEqual([taggedCast.id]);
            expect(request.shiftCastIds).toEqual([
                taggedCast.id,
                boardOnlyCast.id,
            ]);
            expect(request.shift).toEqual({
                date: COMBINED_DATE,
                slot: "evening",
            });

            const postResponse = await page.request.get(
                `${ADMIN_URL}/api/posts/${COMBINED_POST_ID}`,
            );
            expect(postResponse.ok()).toBeTruthy();
            const post = await postResponse.json();
            expect(post.showInGallery).toBe(true);
            expect(post.castTags.map((tag: any) => tag.castid)).toEqual([
                taggedCast.id,
            ]);

            const shiftResponse = await page.request.get(
                `${ADMIN_URL}/api/shifts?date=${COMBINED_DATE}&shift=evening`,
            );
            expect(shiftResponse.ok()).toBeTruthy();
            const shift = await shiftResponse.json();
            expect(shift.sourcePostId).toBe(COMBINED_POST_ID);
            expect(shift.castIds.sort()).toEqual(
                [taggedCast.id, boardOnlyCast.id].sort(),
            );
        });

        test("シフトだけ登録したポストはギャラリータグを持たず非公開になる", async ({
            page,
        }) => {
            await Promise.all([
                page.goto(ADMIN_URL),
                page.waitForResponse((response: any) =>
                    response.url().includes("/api/casts"),
                ),
            ]);
            await page
                .getByTestId("tweet-id-input")
                .fill(SHIFT_ONLY_POST_ID);
            await page.getByTestId("gallery-destination-checkbox").uncheck();
            await page.getByTestId("shift-destination-checkbox").check();
            await selectCast(
                page,
                "出勤中のキャストを選択",
                taggedCast.name,
            );

            const responsePromise = page.waitForResponse(
                (response) =>
                    response.url() ===
                        `${ADMIN_URL}/api/post-registrations` &&
                    response.request().method() === "POST",
            );
            await page.getByTestId("tweet-register-button").click();
            expect((await responsePromise).status()).toBe(201);

            const postResponse = await page.request.get(
                `${ADMIN_URL}/api/posts/${SHIFT_ONLY_POST_ID}`,
            );
            const post = await postResponse.json();
            expect(post.showInGallery).toBe(false);
            expect(post.castTags).toEqual([]);

            await page.goto(GALLERY_URL);
            await expect(
                page.getByTestId(`tweet-container-${SHIFT_ONLY_POST_ID}`),
            ).not.toBeVisible();
        });

        test("写真タグが出勤キャストに含まれない不整合なリクエストを拒否する", async ({
            page,
        }) => {
            const response = await page.request.post(
                `${ADMIN_URL}/api/post-registrations`,
                {
                    data: {
                        postId: COMBINED_POST_ID,
                        destinations: { gallery: true, shift: true },
                        taggedCastIds: [taggedCast.id],
                        shiftCastIds: [boardOnlyCast.id],
                    },
                },
            );
            expect(response.status()).toBe(400);
            expect(await response.json()).toEqual({
                error: "写真タグのキャストは出勤キャストにも含めてください",
            });
        });
    });
}
