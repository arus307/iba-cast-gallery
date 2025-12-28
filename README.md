# IbaCastGallery

## iba-cast-gallery
[![Netlify Status](https://api.netlify.com/api/v1/badges/a1c7a42c-99b8-46e1-bff1-b1b262fe93a5/deploy-status)](https://app.netlify.com/sites/iba-cast-gallery/deploys)

# コマンド一覧
※全てモノレポのルートから実行

- `yarn run dev`
  - ローカルでの実行(.env.developmentを読み込む)。
- `yarn run migrate:dev`
  - .env.developmentを読み込みながらマイグレーションを実行する。
- `yarn run migrate:create -- {ファイルパス}`
  - マイグレーションファイルの生成。ファイルパスは`packages/dao`のルートを基準に相対パスで指定する。
- `yarn run migrate:generate -- {ファイルパス}`
  - .env.developmentを使ってDBに接続しコードとDBの差分からマイグレーションを生成する。ファイルパスは`packages/dao`のルートを基準に相対パスで指定。
- `yarn run build`
  - デプロイ用のビルド。

# Preview環境のDB独立化

PRごとに独立したデータベーススキーマを使用する仕組みが導入されています。

**Supabase PostgreSQL対応**: このソリューションはSupabase PostgreSQLで完全に動作します。
**Vercel & Netlify対応**: Vercel、Netlify両方のPreview Deploymentsに対応しています。

詳細は以下のドキュメントを参照してください:
- [セットアップガイド](docs/PREVIEW_DB_SETUP.md) - 全体の設定方法
- [Vercel設定ガイド](docs/VERCEL_SETUP.md) - Vercel特化の詳細ガイド
- [Supabase実現可能性調査](docs/SUPABASE_FEASIBILITY.md) - Supabase互換性情報

**概要:**
- PR作成時に `preview_pr_{PR番号}` という名前のスキーマが自動生成されます
- Preview環境では自動的にそのスキーマを使用します
- PRクローズ時にスキーマが自動削除されます
