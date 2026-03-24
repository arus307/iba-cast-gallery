# Agent モード向けガイド

GitHub Copilot Agent モードがこのリポジトリで自律的に作業するための手順書です。
コードの変更・生成時は必ず `.github/copilot-instructions.md` も参照してください。

## 必須の前提確認

作業を始める前に以下を確認すること：

1. 変更対象が `tweet-tagger` か `iba-cast-gallery` かを特定する
2. Entity を変更する場合は必ず Migration も作成する
3. 既存のコードパターン（Service 層・API Route・Page）に従う

---

## コマンド

すべてモノレポルートから実行する。

```bash
# 開発サーバー起動（両アプリ同時）
yarn dev

# マイグレーション実行
yarn migrate:dev

# マイグレーションファイル新規作成（空ファイル）
yarn migrate:create -- "src/migrations/your-migration-name.ts"

# マイグレーションファイル自動生成（Entity とDBの差分から）
yarn migrate:generate -- "src/migrations/your-migration-name.ts"

# ビルド
yarn build

# E2E テスト実行
npx playwright test

# DB リセット（開発環境のみ）
yarn db:reset
```

---

## 新機能の実装手順

### 1. DB 変更が必要な場合

```
① packages/types/src/ に enum・型定義を追加
② packages/dao/src/entities/ に Entity を追加・更新
③ packages/dao/src/data-source.ts の entities 配列に追加
④ packages/dao/src/index.ts にエクスポートを追加
⑤ yarn migrate:generate でマイグレーション自動生成
   または yarn migrate:create で空ファイルを作って手書き
⑥ yarn migrate:dev でマイグレーション実行
```

### 2. tweet-tagger に機能追加する場合

```
① app/tweet-tagger/src/services/ に Service を追加
② app/tweet-tagger/src/app/api/ に API Route を追加
③ app/tweet-tagger/src/app/client-component/ に Client Component を追加
④ app/tweet-tagger/src/app/ にページを追加
```

### 3. iba-cast-gallery に機能追加する場合

```
① app/iba-cast-gallery/src/services/ に Service を追加
② app/iba-cast-gallery/src/app/api/ に API Route を追加
③ コンポーネントを追加
```

---

## 変更してはいけないこと

- `packages/dao/src/migrations/` 内の既存ファイルは編集しない（済み migration は不変）
- `posts` テーブルへのクエリで `show_in_gallery` フィルタを外さない
- tweet-tagger の API Route から管理者チェックを外さない

---

## E2E テスト

```bash
# 全テスト
npx playwright test

# 特定ファイルのみ
npx playwright test e2e/tweet-flow.spec.ts

# UI モード
npx playwright test --ui
```

テストは `E2E_TESTING=true` 環境変数が必要。`global-setup.ts` で自動ログイン処理が行われる。

---

## よくあるミス

- `"use client"` と `"use server"` の付け忘れ
  - Client Component（useState 等を使うもの）→ `"use client"`
  - Page・Layout（サーバーサイド認証が必要なもの）→ `"use server"`
- Service 関数の先頭に `await initializeDatabase()` を忘れる
- Migration を作ったが `data-source.ts` の entities に追加し忘れる
- `posts` テーブルに insert する際に `show_in_gallery`・`isDeleted` を省略する
  （どちらも nullable でないためエラーになる）
