# Preview環境のDB独立化 実装完了サマリー

## 実装内容

PRごとに独立したデータベーススキーマを使用する仕組みを実装しました。これにより、複数のPreview環境が同じDBスキーマを共有することによる問題（マイグレーション失敗、データ競合など）を解決します。

## 追加されたファイル

### 1. GitHub Actions ワークフロー

#### `.github/workflows/preview-db-setup.yml`
- **トリガー**: PR作成、同期、再オープン時
- **機能**:
  - `preview_pr_{PR番号}` というスキーマを作成
  - マイグレーションを実行
  - PRにスキーマ情報をコメント
- **権限**: `contents: read`, `pull-requests: write`

#### `.github/workflows/preview-db-cleanup.yml`
- **トリガー**: PRクローズ時
- **機能**:
  - PRに対応するスキーマを削除
  - PRにクリーンアップ完了をコメント
- **権限**: `contents: read`, `pull-requests: write`

### 2. スキーマ管理スクリプト

#### `scripts/create-preview-schema.js`
- スキーマの存在チェック
- 既存スキーマがあれば削除
- 新規スキーマを作成
- マイグレーションを実行

#### `scripts/delete-preview-schema.js`
- スキーマの存在チェック
- スキーマをCASCADE削除

### 3. ドキュメント

#### `docs/PREVIEW_DB_SETUP.md`
- セットアップガイド
- GitHub Secretsの設定方法
- Netlify環境変数の設定方法
- トラブルシューティング

#### `README.md`
- Preview環境DB独立化の概要を追加

### 4. 依存関係

#### `package.json`
- `pg: ^8.14.1` をルートレベルに追加

## スキーマ命名規則

```
preview_pr_{PR番号}
```

例:
- PR #1 → `preview_pr_1`
- PR #123 → `preview_pr_123`

## 動作フロー

```
PR作成/更新
    ↓
GitHub Actions (preview-db-setup.yml)
    ↓
スキーマ作成 (scripts/create-preview-schema.js)
    ↓
マイグレーション実行
    ↓
PRにコメント通知
    ↓
Netlify Deploy Preview
    ↓
環境変数 DB_SCHEMA=preview_pr_$REVIEW_ID
    ↓
対応するスキーマに接続
    ↓
独立した環境で動作
    ↓
PRクローズ
    ↓
GitHub Actions (preview-db-cleanup.yml)
    ↓
スキーマ削除 (scripts/delete-preview-schema.js)
    ↓
PRにクリーンアップ完了を通知
```

## セットアップに必要な手動作業

### 1. GitHub Secrets の設定

リポジトリの Settings → Secrets and variables → Actions で以下を設定:

```
PREVIEW_DB_HOST: データベースホスト
PREVIEW_DB_PORT: 5432
PREVIEW_DB_USERNAME: データベースユーザー名
PREVIEW_DB_PASSWORD: データベースパスワード
PREVIEW_DB_DATABASE: データベース名
```

### 2. Netlify 環境変数の設定

Site settings → Build & deploy → Environment で Deploy Previews用に設定:

**共通の環境変数** (Production と同じ):
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `ADMIN_EMAIL`
- その他必要な環境変数

**DB接続設定** (Preview環境専用):
- `DB_HOST`: GitHubシークレットと同じ値
- `DB_PORT`: 5432
- `DB_USERNAME`: GitHubシークレットと同じ値
- `DB_PASSWORD`: GitHubシークレットと同じ値
- `DB_DATABASE`: GitHubシークレットと同じ値
- `DB_MIGRATION_USER_USERNAME`: `DB_USERNAME` と同じ値
- `DB_MIGRATION_USER_PASSWORD`: `DB_PASSWORD` と同じ値

**スキーマ設定** (重要):
```
DB_SCHEMA=preview_pr_$REVIEW_ID
```

Netlifyの `$REVIEW_ID` 環境変数が自動的にPR番号に置き換わります。

## 実装時の検証項目

- ✅ JavaScript構文チェック
- ✅ YAML構文チェック  
- ✅ yamllint検証
- ✅ スキーマ名生成ロジックのテスト
- ✅ コードレビュー対応
- ✅ CodeQLセキュリティスキャン（アラート0件）

## セキュリティ対策

1. **明示的な権限設定**: GitHub Actionsワークフローに最小権限を設定
2. **パラメータ化クエリ**: SQLインジェクション防止
3. **CASCADE削除**: 関連オブジェクトの適切なクリーンアップ

## 今後のメンテナンス

### スキーマのクリーンアップ

定期的に不要なスキーマが残っていないかチェック:

```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'preview_pr_%';
```

### 手動削除が必要な場合

```bash
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export DB_DATABASE=your-database
export PR_NUMBER=123

node scripts/delete-preview-schema.js
```

## トラブルシューティング

詳細は `docs/PREVIEW_DB_SETUP.md` を参照してください。

## 効果

- ✅ 各Preview環境が独立したスキーマを使用
- ✅ マイグレーション競合の解消
- ✅ データ競合の防止
- ✅ PRごとに独立したテスト環境
- ✅ 自動的なクリーンアップ

## 参考リンク

- [Netlify環境変数ドキュメント](https://docs.netlify.com/configure-builds/environment-variables/)
- [PostgreSQL スキーマドキュメント](https://www.postgresql.org/docs/current/ddl-schemas.html)
