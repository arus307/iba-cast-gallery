export type DatabaseEnvironment = Record<string, string | undefined>;

const previewSchemaPattern = /^preview_pr_\d+$/;

/**
 * Vercel Preview が本番スキーマへ接続しないよう、実行時のスキーマ名を検証する。
 */
export const resolveDatabaseSchema = (environment: DatabaseEnvironment): string => {
  const schema = environment.DB_SCHEMA;

  if (environment.VERCEL_ENV === 'preview' && !previewSchemaPattern.test(schema ?? '')) {
    throw new Error(
      'Vercel Preview環境では、DB_SCHEMA に preview_pr_<PR番号> 形式のスキーマ名を設定してください。',
    );
  }

  return schema ?? 'public';
};
