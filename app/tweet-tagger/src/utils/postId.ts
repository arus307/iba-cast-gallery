const X_POST_URL_PATTERN =
  /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[^/\s]+\/status|i\/(?:web\/)?status)\/(\d{1,30})/i;

const POST_ID_PATTERN = /^\d{1,30}$/;

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
