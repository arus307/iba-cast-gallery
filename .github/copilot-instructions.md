# このファイルについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

# 前提

- アプリ内のコメントやドキュメント、PR 時のメッセージは日本語で記述してください。
- 判断に迷う場合は、都度質問してください。
- コードのスタイルガイドはプロジェクト内の他のコードに合わせてください。
- コードの変更を提案する際は、変更理由を明確に説明してください。
- 複数の実装方法が考えられる場合は、それぞれの利点と欠点を説明した上で、最適な方法を提案してください。
- セキュリティとプライバシーを最優先に考慮してください。
- 大きな変更をする場合は、事前にユーザーに方針を確認したください。

# プロジェクト概要

IBAぎゃらりぃ(iba-gallery)は IMAGINARY BASE AKIHABARA というコンセプトカフェの公式X(旧Twitter)アカウントから投稿された画像付きツイートを表示するウェブアプリケーションです。画像にはキャストの写真やイラストが含まれており、ファンがキャストを指定して過去のツイートをまとめて閲覧できるようになっています。
Discordログイン機能を備えており、認証されたユーザーはツイートをお気に入り登録することが出来ます。

## 運用

IBAぎゃらりぃはモノレポ構成で管理されており、以下の2つのアプリケーションで構成されています。
- iba-cast-gallery: メインのキャストギャラリーアプリケーション
  - 通常のユーザーは主にこちらのアプリケーションを利用します。
- tweet-tagger: ツイートにタグを付与するための管理用アプリケーション
  - 管理者がツイートの登録及びタグを付与・編集するために使用します。


## IBA についての基礎知識

IMAGINARY BASE AKIHABARA (IBA)は、秋葉原にあるコンセプトカフェです。キャストにはリアルキャストとイマジナリーキャストの 2 種類が存在し、訪れるお客様に独特な体験を提供しています。リアルキャストは実際に店舗で働くスタッフであり、イマジナリーキャストは仮想的なキャラクターとしてデジタル空間で活動します。

# 技術スタック

Next.js, TypeScript, Playwright, MUI, TypeORM, Supabase(PostgreSQL), Next-Auth, Vercel

# ディレクトリ構造

- /app: Next.js のアプリケーションコード
  - /iba-cast-gallery: キャストギャラリーアプリケーション
  - /tweet-tagger: ツイートタグ付けアプリケーション
- /packages: モノレポ内の共通パッケージ
  - /dao: データアクセスオブジェクト (DAO) パッケージ
  - /db-migrations: データベースマイグレーションスクリプト
  - /shared-types: 共有型定義パッケージ
- /e2e: エンドツーエンドテストコード

# DBスキーマ

## 既存テーブル

| テーブル | 概要 |
|---------|------|
| casts | キャスト情報。type は CastType enum（1=REAL/RC, 2=IMAGINARY/IC） |
| posts | ツイート情報。id はツイートID（varchar PK） |
| post_cast_tags | ポストとキャストの多対多中間テーブル |
| users | Discord ログインユーザー |
| user_accounts | SNS 認証情報 |
| favorites | ユーザーのお気に入り投稿 |

## posts テーブルの追加カラム

| カラム | 型 | デフォルト | 説明 |
|-------|----|----------|------|
| show_in_gallery | boolean | true | ギャラリーへの表示可否。シフト専用ツイートは false |
| shift_source | enum(pending/done) | null | シフト情報源としてのステータス。null=シフト元でない |

- ギャラリーのクエリは必ず `WHERE show_in_gallery = true` を条件に含める
- `shift_source = 'pending'` はシフトデータ未入力、`'done'` は入力済みを意味する

## shifts テーブル（追加）

キャストの出勤シフト記録。出勤予測ツール（iba-predicator）のデータソース。

| カラム | 型 | 説明 |
|-------|----|------|
| id | SERIAL PK | |
| date | date | 出勤日 |
| shift | enum(open/evening/night) | シフト枠 |
| cast_id | int FK→casts.id | 出勤キャスト |
| source_post_id | varchar(30) nullable FK→posts.id | データ元のツイートID |
| created_at | timestamptz | |

- UNIQUE 制約: (date, shift, cast_id)
- 同じ日・シフトのデータは保存時に洗い替え（DELETE→INSERT）される
- shift の値は英語（open/evening/night）で保存し、UI 表示のみ日本語

## Entity・型定義の場所

- Entity: `packages/dao/src/entities/`
- 共有型: `packages/types/src/`（ShiftSlot, ShiftSourceStatus, CastType など）
- Migration: `packages/dao/src/migrations/`（ファイル名はタイムスタンプ prefix）

# 機能一覧

## iba-cast-gallery（公開アプリ）

- キャスト別ツイートギャラリー
- Discord ログイン・お気に入り機能

## tweet-tagger（管理アプリ）

- ツイート登録・キャストタグ付け（既存）
- **シフト登録**（追加済み）
  - `/shifts` — シフト入力画面
  - ツイートURL を入力してツイートを確認しながらキャストを選択
  - 日付・シフト変更時に既存記録を自動ロード

## tweet-tagger の API 一覧

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/casts` | GET | キャスト一覧 |
| `/api/posts` | GET / POST | ポスト一覧取得・登録 |
| `/api/posts/[postId]` | GET / DELETE | ポスト取得・削除 |
| `/api/shifts` | GET | ?date=&shift= で記録取得 |
| `/api/shifts` | POST | シフト登録（洗い替え） |
| `/api/shifts/export` | GET | shifts.csv ダウンロード |

すべてのエンドポイントで `session?.user?.email !== process.env.ADMIN_EMAIL` による管理者チェックが必要。

# 実装パターン

## Service 層

```typescript
import "server-only";
import "reflect-metadata";
import { initializeDatabase, appDataSource } from "../data-source";
import { Repository } from "@iba-cast-gallery/dao";

export async function someFunction() {
    await initializeDatabase();
    const repo: Repository<Entity> = appDataSource.getRepository(Entity);
    // ...
}
```

## API Route

```typescript
import { auth } from "auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        // ...
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
```

## Page（サーバーコンポーネント）

```typescript
"use server";
import { auth } from "auth";
import { redirect } from "next/navigation";
import NotAdmin from "app/client-component/NotAdmin";

export default async function SomePage() {
    const session = await auth();
    if (!session?.user) redirect("/api/auth/signin");
    if (session.user.email !== process.env.ADMIN_EMAIL) return <NotAdmin />;
    // ...
}
```

