# Vercel Preview Deployments での設定ガイド

このドキュメントでは、Vercel Preview Deploymentsで独立したDBスキーマを使用するための設定方法を詳しく説明します。

## Vercelの環境変数システム

Vercelは自動的にシステム環境変数を提供し、デプロイメントの種類やPR情報を識別できます。

### 重要な環境変数

1. **VERCEL_GIT_PULL_REQUEST_ID**
   - Pull Requestの番号
   - **Preview Deploymentでのみ利用可能**
   - 例: `"123"` (PR #123の場合)

2. **VERCEL_ENV**
   - デプロイメント環境の種類
   - 値: `"production"`, `"preview"`, `"development"`

3. **VERCEL_GIT_COMMIT_REF**
   - ブランチ名またはタグ名
   - 例: `"feature/my-branch"`

## 設定手順

### 1. Vercel Dashboardでの環境変数設定

1. Vercelプロジェクトにアクセス
2. **Settings** → **Environment Variables** を開く
3. 以下の環境変数を追加

### 2. Preview環境用の環境変数

**Environment**: `Preview` を選択

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DB_SCHEMA` | `preview_pr_$VERCEL_GIT_PULL_REQUEST_ID` | **最重要**: PR番号を含むスキーマ名 |
| `DB_HOST` | `db.xxxxxxxxxxxxx.supabase.co` | Supabaseのホスト |
| `DB_PORT` | `5432` | PostgreSQLポート（Direct Connection） |
| `DB_USERNAME` | `postgres` | データベースユーザー名 |
| `DB_PASSWORD` | `your-password` | データベースパスワード |
| `DB_DATABASE` | `postgres` | データベース名 |
| `DB_MIGRATION_USER_USERNAME` | `postgres` | マイグレーション用ユーザー名 |
| `DB_MIGRATION_USER_PASSWORD` | `your-password` | マイグレーション用パスワード |
| `AUTH_SECRET` | `your-auth-secret` | 認証シークレット |
| `AUTH_DISCORD_ID` | `your-discord-id` | Discord OAuth App ID |
| `AUTH_DISCORD_SECRET` | `your-discord-secret` | Discord OAuth Secret |
| `ADMIN_EMAIL` | `admin@example.com` | 管理者メールアドレス |

### 3. Production環境用の環境変数

**Environment**: `Production` を選択

同じ変数を設定しますが、以下の点が異なります:

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DB_SCHEMA` | `public` | Productionでは公開スキーマを使用 |

その他の変数（DB_HOST, DB_PORT等）はPreview環境と同じ値を設定できます。

### 4. Development環境用の環境変数（オプション）

**Environment**: `Development` を選択

ローカル開発用の環境変数を設定できます。

## スキーマ名の展開

### Preview Deployment での動作

PR #123 を作成した場合:

```javascript
// Vercelが自動設定
process.env.VERCEL_GIT_PULL_REQUEST_ID = "123"

// 設定した環境変数
process.env.DB_SCHEMA = "preview_pr_$VERCEL_GIT_PULL_REQUEST_ID"

// 実際に展開される値
process.env.DB_SCHEMA = "preview_pr_123"
```

### Production Deployment での動作

```javascript
// Vercelが自動設定
process.env.VERCEL_ENV = "production"
process.env.VERCEL_GIT_PULL_REQUEST_ID = undefined

// 設定した環境変数
process.env.DB_SCHEMA = "public"

// 実際の値
process.env.DB_SCHEMA = "public"
```

## 動作確認方法

### 1. 環境変数の確認

Vercel Deployment Logsで環境変数を確認:

```javascript
// Next.jsのサーバーサイドコードに一時的に追加
console.log('Environment Check:');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('VERCEL_GIT_PULL_REQUEST_ID:', process.env.VERCEL_GIT_PULL_REQUEST_ID);
console.log('DB_SCHEMA:', process.env.DB_SCHEMA);
```

期待される出力（Preview Deployment）:
```
Environment Check:
VERCEL_ENV: preview
VERCEL_GIT_PULL_REQUEST_ID: 123
DB_SCHEMA: preview_pr_123
```

期待される出力（Production Deployment）:
```
Environment Check:
VERCEL_ENV: production
VERCEL_GIT_PULL_REQUEST_ID: undefined
DB_SCHEMA: public
```

### 2. データベース接続の確認

Preview Deploymentにアクセスして、アプリケーションが正常に動作することを確認します。

### 3. GitHub Actionsの確認

1. PRを作成
2. GitHub Actionsで `Preview DB Setup` が実行される
3. PRコメントでスキーマ名 `preview_pr_123` が表示される
4. Vercel Preview Deploymentが `preview_pr_123` スキーマに接続

## トラブルシューティング

### Preview環境でDB_SCHEMAが展開されない

**症状**: `DB_SCHEMA` が `preview_pr_` となり、PR番号が含まれない

**原因**: `VERCEL_GIT_PULL_REQUEST_ID` が設定されていない

**解決策**:
1. Vercel Dashboardで環境変数の **Environment** が `Preview` に設定されているか確認
2. PRからのデプロイメントであることを確認（直接ブランチをデプロイした場合、PR IDは設定されません）

### Production環境でエラーが発生

**症状**: Production環境で `preview_pr_undefined` スキーマに接続しようとする

**原因**: Production環境で `DB_SCHEMA=preview_pr_$VERCEL_GIT_PULL_REQUEST_ID` が設定されている

**解決策**:
1. Vercel Dashboardで `DB_SCHEMA` の **Environment** を確認
2. Production環境用に `DB_SCHEMA=public` を別途設定

### 環境変数が更新されない

**症状**: 環境変数を変更したが、デプロイメントに反映されない

**解決策**:
1. Vercel Dashboardで環境変数を変更後、**Redeploy** が必要
2. または新しいコミットをプッシュして再デプロイ

## ベストプラクティス

### 1. 環境ごとの明示的な設定

各環境（Production, Preview, Development）に対して明示的に環境変数を設定することをお勧めします。

### 2. シークレット情報の管理

- データベースパスワードなどのシークレット情報は、Vercelの環境変数として安全に保管
- `.env` ファイルには含めない
- リポジトリにコミットしない

### 3. 環境変数の検証

デプロイメント後、必ず環境変数が正しく設定されているかログで確認してください。

## まとめ

| 環境 | DB_SCHEMA設定値 | VERCEL_GIT_PULL_REQUEST_ID |
|------|----------------|----------------------------|
| Production | `public` | undefined |
| Preview | `preview_pr_$VERCEL_GIT_PULL_REQUEST_ID` | PR番号（例: "123"） |
| Development | （ローカル設定） | undefined |

Vercel Preview Deploymentsを使用する場合、`VERCEL_GIT_PULL_REQUEST_ID` を活用することで、各PRごとに独立したDBスキーマを自動的に使用できます。
