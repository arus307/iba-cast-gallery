/**
 * 現在の環境に応じたベースURLを取得します。
 * サーバーサイドでもクライアントサイドでも使用できます。
 */
export const getBaseUrl = (): string => {
    // 1. ブラウザ環境の場合 (クライアントサイド)
    if (typeof window !== 'undefined') {
      // クライアントサイドでは NEXT_PUBLIC_* 変数を参照
      // まず明示的な BASE_URL を確認 (Production/Development 用に設定したもの)
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }
      // Preview 環境などで VERCEL_URL を使う
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      }
    }
  
    // 2. サーバーサイド環境の場合
    // まず明示的な BASE_URL を確認 (Production/Development 用に設定したもの)
    // NEXT_PUBLIC_ はサーバーサイドでも参照可能
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Preview 環境などで VERCEL_URL を使う (サーバーサイドでは VERCEL_URL を直接参照可能)
    // NEXT_PUBLIC_VERCEL_URL がなくても VERCEL_URL がある場合がある
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  
    // 3. フォールバック (主にローカル開発用だが、環境変数が未設定の場合)
    return 'http://localhost:3000';
};