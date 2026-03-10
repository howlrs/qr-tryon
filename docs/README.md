# Manage with QR - 店舗商品管理システム

QRコードを活用した店舗商品管理システム。商品にQRコードを付与し、来店客がスマートフォンで商品情報を閲覧、試着・購入リクエストを送信できる。店舗スタッフは管理画面でリアルタイムに通知を受け取り、接客対応を効率化する。

## 主な機能

| 機能 | 説明 |
|------|------|
| 商品管理（CRUD） | 商品の登録・編集・削除・一覧表示 |
| バリエーション管理 | サイズ・色・価格・在庫をバリエーション単位で管理 |
| QRコード生成 | 商品ごとのQRコードを生成・PNG形式でダウンロード |
| 商品公開ページ | 来店客向けの商品一覧・詳細表示 |
| 試着/購入リクエスト | 来店客がボタンひとつでスタッフに通知を送信 |
| 注文管理 | リクエスト一覧の確認・既読管理 |
| 多言語対応 | 日本語（デフォルト）・英語 |

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| 国際化 | next-intl 4 |
| QRコード | qrcode.react 4 |
| アイコン | lucide-react |
| フォント | Geist Sans / Geist Mono (Google Fonts) |

## 前提条件

- **Node.js** 18.17 以上
- **npm** 9 以上（または yarn / pnpm）

## セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd manage-with-qr

# 依存関係をインストール
cd frontend
npm install
```

## 起動方法

### 開発サーバー

```bash
npm run dev
```

http://localhost:3000 で起動する。

### 本番ビルド

```bash
npm run build
npm start
```

### リント

```bash
npm run lint
```

## アクセスURL

| 画面 | URL | 説明 |
|------|-----|------|
| トップページ | `/{locale}` | ランディングページ |
| 商品一覧 | `/{locale}/products` | 公開商品一覧 |
| 商品詳細 | `/{locale}/products/{id}` | 商品詳細・試着/購入ボタン |
| 管理画面トップ | `/{locale}/admin` | 商品管理テーブル |
| 商品新規登録 | `/{locale}/admin/products/new` | 商品登録フォーム |
| 商品編集 | `/{locale}/admin/products/{id}/edit` | 商品編集フォーム |
| 注文管理 | `/{locale}/admin/orders` | リクエスト一覧 |

`{locale}` は `ja`（デフォルト）または `en`。

## 現在の開発状況

本プロジェクトは段階的に開発を進めている。現在は **フェーズ1（フロントエンド + モックAPI）** の段階にある。

| フェーズ | 内容 | 状態 |
|----------|------|------|
| 1 | Next.js フロントエンド + モックデータ | 実装済み |
| 2 | Go バックエンド API 構築 | 未着手 |
| 3 | PostgreSQL データベース接続 | 未着手 |
| 4 | フロント・バック統合テスト | 未着手 |

詳細は [plan.md](./plan.md) および [requirements.md](./requirements.md) を参照。

## 関連ドキュメント

- [使用書（ユーザーガイド）](./user-guide.md) — 管理者・来店客向けの操作マニュアル
- [開発者ガイド](./developer-guide.md) — ディレクトリ構成、コンポーネント一覧、API仕様
- [アーキテクチャ](./architecture.md) — 技術設計、データフロー、将来計画
- [要件定義](./requirements.md) — 機能要件・データモデル
- [実装計画](./plan.md) — 開発手順・フェーズ計画
