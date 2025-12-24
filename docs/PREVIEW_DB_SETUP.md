# Preview環境のDB独立化設定ガイド

このドキュメントでは、PRごとに独立したデータベーススキーマを使用するPreview環境の設定方法を説明します。

## 概要

PRが作成されると、自動的に専用のデータベーススキーマが作成され、Preview環境ではそのスキーマを使用します。PRがクローズされると、スキーマは自動的に削除されます。

## アーキテクチャ

- **スキーマ命名規則**: `preview_pr_{PR番号}`
  - 例: PR #123 の場合、`preview_pr_123` というスキーマが作成されます
- **自動化**:
  - PR作成/更新時: `.github/workflows/preview-db-setup.yml` が実行され、スキーマを作成しマイグレーションを実行
  - PRクローズ時: `.github/workflows/preview-db-cleanup.yml` が実行され、スキーマを削除

## GitHub Secretsの設定

リポジトリの Settings → Secrets and variables → Actions で以下のSecretsを設定してください:

- `PREVIEW_DB_HOST`: Preview環境用のデータベースホスト (例: `your-db-host.supabase.co`)
- `PREVIEW_DB_PORT`: データベースポート (通常は `5432`)
- `PREVIEW_DB_USERNAME`: データベースユーザー名
- `PREVIEW_DB_PASSWORD`: データベースパスワード
- `PREVIEW_DB_DATABASE`: データベース名

## Netlify Deploy Previewの設定

### 環境変数の設定

Netlify の Site settings → Build & deploy → Environment で、Deploy Previews用の環境変数を設定します:

1. **共通の環境変数** (production と同じ値):
   - `AUTH_SECRET`
   - `AUTH_DISCORD_ID`
   - `AUTH_DISCORD_SECRET`
   - `ADMIN_EMAIL`
   - その他必要な環境変数

2. **DB接続設定** (Preview環境専用):
   - `DB_HOST`: GitHubシークレットと同じ値
   - `DB_PORT`: GitHubシークレットと同じ値
   - `DB_USERNAME`: GitHubシークレットと同じ値
   - `DB_PASSWORD`: GitHubシークレットと同じ値
   - `DB_DATABASE`: GitHubシークレットと同じ値
   - `DB_MIGRATION_USER_USERNAME`: `DB_USERNAME` と同じ値
   - `DB_MIGRATION_USER_PASSWORD`: `DB_PASSWORD` と同じ値

3. **スキーマ設定** (重要):
   - `DB_SCHEMA`: `preview_pr_$REVIEW_ID`
   
   Netlify では `$REVIEW_ID` という環境変数がDeploy Previewで自動的に設定され、PR番号が入ります。
   これにより、各Preview環境が自動的に対応するスキーマを使用します。

### 設定例

```bash
# Production環境 (productionブランチ用)
DB_SCHEMA=public

# Deploy Previews環境 (PR用)
DB_SCHEMA=preview_pr_$REVIEW_ID
```

## 動作確認

1. 新しいPRを作成します
2. GitHub Actionsで `Preview DB Setup` ワークフローが実行されることを確認します
3. PRにコメントが追加され、スキーマ名が表示されることを確認します
4. Netlify Deploy Previewがデプロイされ、正常に動作することを確認します
5. PRをクローズします
6. GitHub Actionsで `Preview DB Cleanup` ワークフローが実行され、スキーマが削除されることを確認します

## トラブルシューティング

### マイグレーションが失敗する

- GitHub Secretsが正しく設定されているか確認してください
- データベースユーザーにスキーマ作成権限があることを確認してください

### Preview環境で接続エラーが発生する

- Netlifyの環境変数が正しく設定されているか確認してください
- 特に `DB_SCHEMA=preview_pr_$REVIEW_ID` が Deploy Previews用に設定されているか確認してください

### スキーマが残ってしまう

手動でスキーマを削除する場合:

```bash
# 環境変数を設定
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export DB_DATABASE=your-database
export PR_NUMBER=123  # 削除したいPR番号

# スクリプトを実行
node scripts/delete-preview-schema.js
```

## メンテナンス

定期的に不要なスキーマが残っていないか確認することをお勧めします:

```sql
-- preview_pr_ で始まるスキーマを一覧表示
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'preview_pr_%';
```

クローズされたPRのスキーマは削除してください:

```sql
-- 例: PR #123 のスキーマを削除
DROP SCHEMA IF EXISTS preview_pr_123 CASCADE;
```
