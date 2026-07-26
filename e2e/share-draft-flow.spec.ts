import { expect, test } from "@playwright/test";

const ADMIN_URL = "http://localhost:3001";
const DRAFT_POST_ID = "2999999999999999901";
const PUBLISHED_POST_ID = "2999999999999999902";

async function login(page: any) {
  await page.request.post(`${ADMIN_URL}/api/auth/e2e-login`);
}

async function deleteTestPost(page: any, postId: string) {
  await page.request.delete(`${ADMIN_URL}/api/posts/${postId}`);
}

test.describe("X共有からのドラフト保存", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("共有されたXポストを非公開ドラフトとして保存すること", async ({ page }) => {
    await deleteTestPost(page, DRAFT_POST_ID);

    try {
      const response = await page.request.post(`${ADMIN_URL}/share`, {
        form: {
          text: `共有テキスト https://x.com/iba_official/status/${DRAFT_POST_ID}`,
        },
        maxRedirects: 0,
      });

      expect(response.status()).toBe(303);
      expect(response.headers().location).toContain(
        `/posts/${DRAFT_POST_ID}/edit?shared=1`,
      );

      const savedPostResponse = await page.request.get(
        `${ADMIN_URL}/api/posts/${DRAFT_POST_ID}`,
      );
      expect(savedPostResponse.ok()).toBeTruthy();

      const savedPost = await savedPostResponse.json();
      expect(savedPost.showInGallery).toBe(false);
      expect(savedPost.castTags).toEqual([]);

      await page.goto(`${ADMIN_URL}/posts/${DRAFT_POST_ID}/edit`);
      await expect(page.getByTestId("draft-status")).toContainText(
        "ドラフト保存済みです",
      );

      const publishResponsePromise = page.waitForResponse(
        (res) =>
          res.url() === `${ADMIN_URL}/api/posts` &&
          res.request().method() === "POST",
      );
      await page.getByTestId("tweet-register-button").click();
      const publishResponse = await publishResponsePromise;
      expect(publishResponse.status()).toBe(201);
      await expect(page).toHaveURL(`${ADMIN_URL}/posts`);

      const publishedPostResponse = await page.request.get(
        `${ADMIN_URL}/api/posts/${DRAFT_POST_ID}`,
      );
      expect(publishedPostResponse.ok()).toBeTruthy();
      const publishedPost = await publishedPostResponse.json();
      expect(publishedPost.showInGallery).toBe(true);
    } finally {
      await deleteTestPost(page, DRAFT_POST_ID);
    }
  });

  test("公開済みポストを再共有してもドラフトへ戻さないこと", async ({ page }) => {
    await deleteTestPost(page, PUBLISHED_POST_ID);

    try {
      const registerResponse = await page.request.post(
        `${ADMIN_URL}/api/posts`,
        {
          data: {
            post: {
              id: PUBLISHED_POST_ID,
              postedAt: new Date().toISOString(),
              isDeleted: false,
              showInGallery: true,
              shiftSource: null,
              castTags: [],
              taggedCasts: [],
              favorites: [],
            },
          },
        },
      );
      expect(registerResponse.ok()).toBeTruthy();

      const shareResponse = await page.request.post(`${ADMIN_URL}/share`, {
        form: {
          url: `https://x.com/iba_official/status/${PUBLISHED_POST_ID}`,
        },
        maxRedirects: 0,
      });
      expect(shareResponse.status()).toBe(303);

      const savedPostResponse = await page.request.get(
        `${ADMIN_URL}/api/posts/${PUBLISHED_POST_ID}`,
      );
      expect(savedPostResponse.ok()).toBeTruthy();
      const savedPost = await savedPostResponse.json();
      expect(savedPost.showInGallery).toBe(true);
    } finally {
      await deleteTestPost(page, PUBLISHED_POST_ID);
    }
  });

  test("マニフェストにX共有の受け口が定義されていること", async ({ page }) => {
    const response = await page.request.get(`${ADMIN_URL}/manifest.webmanifest`);
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.share_target).toEqual({
      action: "/share",
      method: "POST",
      enctype: "application/x-www-form-urlencoded",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    });
  });
});
