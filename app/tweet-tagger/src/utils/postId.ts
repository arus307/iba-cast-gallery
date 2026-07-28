const X_POST_URL_PATTERN =
  /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[^/\s]+\/status|i\/(?:web\/)?status)\/(\d{1,30})/i;

const POST_ID_PATTERN = /^\d{1,30}$/;

const X_SNOWFLAKE_EPOCH_MS = BigInt("1288834974657");
const X_SNOWFLAKE_TIMESTAMP_SHIFT = BigInt(22);

/**
 * X の共有テキスト・URL・ポストIDからポストIDを取り出す。
 */
export function extractPostId(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;

    const urlMatch = candidate.match(X_POST_URL_PATTERN);
    if (urlMatch) {
      return urlMatch[1];
    }

    const value = candidate.trim();
    if (POST_ID_PATTERN.test(value)) {
      return value;
    }
  }

  return null;
}

/**
 * X のSnowflake IDに含まれるタイムスタンプから投稿日時を取得する。
 */
export function getPostCreatedAtFromId(postId: string): Date | null {
  if (!POST_ID_PATTERN.test(postId)) {
    return null;
  }

  const timestamp =
    (BigInt(postId) >> X_SNOWFLAKE_TIMESTAMP_SHIFT) + X_SNOWFLAKE_EPOCH_MS;
  const createdAt = new Date(Number(timestamp));

  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
}
