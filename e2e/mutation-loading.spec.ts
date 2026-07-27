import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const ADMIN_URL = "http://localhost:3001";

function createRequestGate() {
    let markReached!: () => void;
    let release!: () => void;
    const reached = new Promise<void>((resolve) => {
        markReached = resolve;
    });
    const released = new Promise<void>((resolve) => {
        release = resolve;
    });

    return {
        reached,
        release,
        wait: async () => {
            markReached();
            await released;
        },
    };
}

async function login(page: Page) {
    await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

async function expectLoading(button: Locator, label: string) {
    await expect(button).toBeDisabled();
    await expect(button).toContainText(label);
    await expect(button.getByRole("progressbar")).toBeVisible();
}

test.describe("管理画面のAPI待機表示", () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test("キャスト登録中は登録ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        await page.route("**/api/casts", async (route) => {
            if (route.request().method() !== "POST") {
                await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
                return;
            }

            await gate.wait();
            await route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({ id: 999 }),
            });
        });

        await page.goto(`${ADMIN_URL}/casts`);
        await page.getByTestId("cast-name-input").fill("ローディングテスト");
        await page.getByTestId("cast-en-name-input").fill("loading-test");
        await page.getByTestId("cast-introduce-post-input").fill("2999999999999999910");

        const button = page.getByTestId("cast-save-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "登録中...");

        gate.release();
        await click;
        await expect(button.getByRole("progressbar")).not.toBeVisible();
        await expect(button).toContainText("登録する");
    });

    test("ポスト登録中は登録ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/posts", async (route) => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }

            await gate.wait();
            await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
        });

        await page.goto(ADMIN_URL);
        const button = page.getByTestId("tweet-register-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "登録中...");

        gate.release();
        await click;
        await expect(button).toBeEnabled();
        await expect(button).toContainText("登録");
    });

    test("イベント登録中は登録ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/events", async (route) => {
            if (route.request().method() === "GET") {
                await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
                return;
            }

            await gate.wait();
            await route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({ id: 91 }),
            });
        });

        await page.goto(`${ADMIN_URL}/events`);
        await page.getByTestId("event-title-input").fill("ローディングテストイベント");

        const button = page.getByTestId("event-save-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "登録中...");

        gate.release();
        await click;
        await expect(button.getByRole("progressbar")).not.toBeVisible();
        await expect(button).toContainText("登録する");
    });

    test("イベント更新中は更新・キャンセルボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        const event = {
            id: 92,
            eventType: "cast_event",
            title: "更新前イベント",
            dateStart: "2099-11-01",
            dateEnd: "2099-11-01",
            timeNote: null,
            notes: null,
            sourcePostId: null,
            casts: [],
        };
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/events", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([event]),
            });
        });
        await page.route("**/api/events/92", async (route) => {
            if (route.request().method() !== "PUT") {
                await route.continue();
                return;
            }

            await gate.wait();
            await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        });

        await page.goto(`${ADMIN_URL}/events`);
        await page.getByTestId("event-list-row-92").getByRole("button", { name: "編集" }).click();
        await page.getByTestId("event-title-input").fill("更新後イベント");

        const button = page.getByTestId("event-save-button");
        const cancelButton = page.getByTestId("event-cancel-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "更新中...");
        await expect(cancelButton).toBeDisabled();

        gate.release();
        await click;
    });

    test("シフト保存中は保存ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/shifts?*", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ castIds: [], sourcePostId: null }),
            });
        });
        await page.route("**/api/shifts/list", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/shifts", async (route) => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }

            await gate.wait();
            await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        });

        await page.goto(`${ADMIN_URL}/shifts`);
        const button = page.getByTestId("shift-save-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "保存中...");

        gate.release();
        await click;
        await expect(button).toBeEnabled();
    });

    test("シフト情報源の保存中は保存ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/shifts?*", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ castIds: [], sourcePostId: null }),
            });
        });
        await page.route("**/api/shifts/list", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([{
                    date: "2099-11-01",
                    dayOfWeek: "日",
                    shift: "night",
                    casts: [],
                    sourcePostId: null,
                }]),
            });
        });
        await page.route("**/api/shifts/source", async (route) => {
            await gate.wait();
            await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        });

        await page.goto(`${ADMIN_URL}/shifts`);
        await page.getByTestId("shift-add-source-2099-11-01-night").click();
        const dialog = page.getByTestId("shift-add-source-dialog");
        await dialog.getByTestId("add-source-tweet-input").fill("2999999999999999920");

        const button = dialog.getByTestId("add-source-save-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "保存中...");

        gate.release();
        await click;
        await expect(dialog).not.toBeVisible();
    });

    test("イベント削除中は対象ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        const event = {
            id: 93,
            eventType: "cast_event",
            title: "削除対象イベント",
            dateStart: "2099-11-01",
            dateEnd: "2099-11-01",
            timeNote: null,
            notes: null,
            sourcePostId: null,
            casts: [],
        };
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route("**/api/events", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify([event]),
            });
        });
        await page.route("**/api/events/93", async (route) => {
            await gate.wait();
            await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        });

        await page.goto(`${ADMIN_URL}/events`);
        page.once("dialog", (dialog) => dialog.accept());
        const button = page.getByTestId("event-delete-button-93");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "削除中...");

        gate.release();
        await click;
        await expect(page.getByTestId("event-list-row-93")).not.toBeVisible();
    });

    test("ポスト削除中は確定ボタンを無効化してローディング表示する", async ({ page }) => {
        const gate = createRequestGate();
        const postId = "2999999999999999930";
        const post = {
            id: postId,
            postedAt: "2099-11-01T00:00:00.000Z",
            isDeleted: false,
            showInGallery: true,
            shiftSource: null,
            castTags: [],
            taggedCasts: [],
            favorites: [],
        };
        await page.route("**/api/casts", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await page.route(`**/api/posts/${postId}`, async (route) => {
            if (route.request().method() === "GET") {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(post),
                });
                return;
            }

            await gate.wait();
            await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
        });

        await page.goto(`${ADMIN_URL}/posts/${postId}/edit`);
        await page.getByRole("button", { name: "削除", exact: true }).click();

        const button = page.getByTestId("tweet-delete-confirm-button");
        const click = button.click();
        await gate.reached;
        await expectLoading(button, "削除中...");

        page.once("dialog", (dialog) => dialog.accept());
        gate.release();
        await click;
        await expect(page).toHaveURL(`${ADMIN_URL}/posts`);
    });
});
