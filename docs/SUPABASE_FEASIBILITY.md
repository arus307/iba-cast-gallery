# Supabase PostgreSQL での実現可能性調査

## ✅ 結論: **実現可能です**

既に実装したソリューションはSupabase PostgreSQLで問題なく動作します。

## Supabase PostgreSQL の特徴

### 1. 標準のPostgreSQL
- Supabaseは**標準的なPostgreSQL 15**をベースにしています
- PostgreSQLのスキーマ機能を完全にサポート
- 複数スキーマの作成・管理が可能

### 2. 接続方法
Supabaseは以下の接続方法を提供:
- **Direct Connection** (推奨): 標準のPostgreSQL接続（ポート 5432）
- Connection Pooling: Supavisor経由の接続（ポート 6543）

本実装では Direct Connection を使用します。

### 3. 必要な権限
Supabaseで提供されるデータベースユーザーは:
- ✅ スキーマ作成権限 (`CREATE SCHEMA`) を持っています
- ✅ テーブル作成権限を持っています
- ✅ 既存スキーマの削除権限を持っています

## 実装の互換性確認

### ✅ 1. スキーマ作成
```sql
CREATE SCHEMA "preview_pr_123";
```
→ **Supabaseで動作します**

### ✅ 2. スキーマ削除
```sql
DROP SCHEMA "preview_pr_123" CASCADE;
```
→ **Supabaseで動作します**

### ✅ 3. スキーマ指定での接続
TypeORMの設定:
```javascript
{
  schema: process.env.DB_SCHEMA,
  extra: {
    options: `-c search_path=${process.env.DB_SCHEMA || 'public'},public`
  }
}
```
→ **Supabaseで動作します**

### ✅ 4. マイグレーション実行
```bash
yarn migrate
```
環境変数 `DB_SCHEMA=preview_pr_123` を設定して実行
→ **Supabaseで動作します**

## Supabase接続情報の取得方法

Supabaseダッシュボードで以下の情報を取得:

1. **Project Settings** → **Database** にアクセス

2. **Connection String** セクションで以下を確認:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: プロジェクト作成時に設定したパスワード

3. または **Connection Info** セクションで個別に確認可能

## GitHub Secrets 設定例（Supabase用）

```
PREVIEW_DB_HOST=db.xxxxxxxxxxxxx.supabase.co
PREVIEW_DB_PORT=5432
PREVIEW_DB_USERNAME=postgres
PREVIEW_DB_PASSWORD=your-supabase-password
PREVIEW_DB_DATABASE=postgres
```

## 注意事項とベストプラクティス

### 1. Connection Pooling vs Direct Connection
- **推奨**: Direct Connection (ポート 5432)
- **理由**: スキーマ作成などのDDL操作はDirect Connectionで実行すべき
- Connection Pooling (ポート 6543) はアプリケーションの通常のクエリ用

### 2. Row Level Security (RLS)
- Supabaseの RLS はテーブルレベルで設定されます
- 新しいスキーマで作成されるテーブルには、デフォルトでRLSは適用されません
- Preview環境では通常RLSは不要（テスト用途のため）

### 3. スキーマ数の上限
- PostgreSQLには理論上のスキーマ数制限はありません
- Supabaseの無料プランでも複数スキーマの作成に制限はありません
- ただし、適切なクリーンアップ（PRクローズ時の削除）は重要

### 4. データベース容量
- スキーマごとに独立したテーブルが作成されます
- Preview環境は通常テストデータのみなので容量は小さい
- Supabase無料プラン: 500MB まで
- Supabase Proプラン: 8GB から開始

## セキュリティ考慮事項

### ✅ 既に実装済み
1. パラメータ化クエリでSQLインジェクション防止
2. 明示的な権限設定（GitHub Actions）
3. 環境変数での認証情報管理

### 追加推奨事項（Supabase固有）
1. **Database Password**: 強力なパスワードを使用
2. **IP制限**: 必要に応じてSupabaseダッシュボードでIP制限を設定可能
3. **SSL接続**: デフォルトで有効（推奨）

## 動作確認手順

### 1. ローカルでのテスト
```bash
# Supabase接続情報を環境変数に設定
export DB_HOST=db.xxxxxxxxxxxxx.supabase.co
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=your-password
export DB_DATABASE=postgres
export PR_NUMBER=999

# スキーマ作成スクリプトを実行
node scripts/create-preview-schema.js

# Supabaseダッシュボードの SQL Editor で確認
# SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'preview_pr_999';

# スキーマ削除スクリプトを実行
node scripts/delete-preview-schema.js
```

### 2. GitHub Actions でのテスト
1. GitHub Secrets を設定
2. テストPRを作成
3. Actionsログでスキーマ作成を確認
4. Supabaseダッシュボードで実際にスキーマが作成されたか確認

## コスト影響

### Supabase無料プラン
- ✅ スキーマ作成・削除: 無料
- ✅ データベース接続: 無料
- ⚠️ 容量制限: 500MB（Preview環境では十分）
- ⚠️ 同時接続数: 最大60（Preview環境では十分）

### Supabase Proプラン
- すべての制限が緩和されます
- より多くのPreview環境を同時に運用可能

## トラブルシューティング（Supabase固有）

### エラー: "permission denied to create schema"
→ 接続ユーザーが `postgres` ユーザーであることを確認

### エラー: "could not translate host name to address"
→ ホスト名が正しいか確認（`db.xxxxxxxxxxxxx.supabase.co`）

### エラー: "timeout expired"
→ ファイアウォール設定を確認、またはSupabaseの接続設定を確認

### スキーマは作成されるがマイグレーションが失敗
→ `DB_SCHEMA` 環境変数が正しく設定されているか確認

## まとめ

✅ **Supabase PostgreSQLで完全に実現可能**
✅ **既存の実装はそのまま使用可能**
✅ **追加の設定やコード変更は不要**
✅ **標準的なPostgreSQLなので、全機能が利用可能**

必要なのは、Supabaseダッシュボードから接続情報を取得し、GitHub Secretsに設定するだけです。
