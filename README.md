# Manage with QR

店舗商品管理を簡略化し、接客コストを削減するためのQRコード活用システムです。

![1](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/1.png)
![2](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/2.png)
![3](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/3.png)
![4](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/4.png)
![5](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/5.png)
![6](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/6.png)
![7](https://raw.githubusercontent.com/howlrs/qr-tryon/image/for-readme/images/7.png)  


## 概要

このプロジェクトは、実店舗における商品管理と顧客対応を効率化することを目的としています。
各商品に紐付けられたQRコードを通じて、顧客は自身のスマートフォンで詳細情報を確認でき、試着や購入の意思表示をスタッフに通知することができます。

## 主な機能

### 管理画面 (Admin)
- **商品管理**: 商品の一覧表示、登録、編集、削除
- **QRコード**: 商品ごとの印刷用QRコード表示
- **通知**: 顧客からの試着・購入リクエストの受信

### 顧客用画面 (Client)
- **商品詳細**: QRコード読み取りによる商品情報の閲覧
- **アクション**: 「試着したい」「購入したい」ボタンによるスタッフ呼び出し

## 技術スタック

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Go (予定)
- **Database**: PostgreSQL (予定)
- **ORM**: Bun (Go) (予定)

## プロジェクト構成

```
.
├── docs/           # 要件定義、設計ドキュメント
├── frontend/       # Next.js フロントエンドアプリケーション
└── README.md       # 本ファイル
```

## 開発フロー

現在は **Phase 1: フロントエンド先行開発** の段階です。
Next.js 上にモックAPIを実装し、UI/UXの検証を行っています。

1. **Frontend**: Next.jsでAPIを含むフロントエンドを構築 (Current)
2. **Backend**: Go言語によるAPIサーバーの構築
3. **Integration**: フロントエンドとバックエンドの統合

## セットアップ (Frontend)

```bash
cd frontend
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。
