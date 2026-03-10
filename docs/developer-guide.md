# 開発者ガイド

本システムのコードベースを理解し、開発に参加するためのガイド。

---

## 1. ディレクトリ構成

```
frontend/
├── app/                          # Next.js App Router
│   ├── globals.css               # グローバルCSS（Tailwind + CSS変数）
│   ├── favicon.ico
│   ├── api/
│   │   └── orders/
│   │       └── route.ts          # 注文APIエンドポイント
│   ├── components/
│   │   └── ProductCard.tsx       # 商品カードコンポーネント
│   ├── (public)/                 # 公開画面ルートグループ
│   │   └── [locale]/
│   │       ├── layout.tsx        # 公開画面ルートレイアウト
│   │       ├── page.tsx          # トップページ
│   │       └── products/
│   │           ├── page.tsx      # 商品一覧ページ
│   │           └── [id]/
│   │               ├── page.tsx              # 商品詳細（サーバーコンポーネント）
│   │               └── ProductDetailClient.tsx # 商品詳細（クライアントコンポーネント）
│   └── (admin)/                  # 管理画面ルートグループ
│       └── [locale]/
│           ├── layout.tsx        # 管理画面ルートレイアウト
│           └── admin/
│               ├── layout.tsx    # 管理画面レイアウト（サイドバー含む）
│               ├── page.tsx      # 商品一覧（管理）
│               ├── components/
│               │   └── AdminSidebar.tsx  # サイドバーナビゲーション
│               ├── orders/
│               │   └── page.tsx  # 注文管理ページ
│               └── products/
│                   ├── new/
│                   │   └── page.tsx       # 商品新規登録
│                   └── [id]/
│                       └── edit/
│                           └── page.tsx   # 商品編集
├── components/                   # 共有コンポーネント
│   └── admin/
│       ├── ProductForm.tsx       # 商品登録・編集フォーム（共通）
│       └── QRCodeModal.tsx       # QRコード表示モーダル
├── types/
│   └── index.ts                  # TypeScript型定義
├── lib/
│   └── mockData.ts               # モックデータ
├── i18n/
│   ├── routing.ts                # ルーティング設定（対応ロケール定義）
│   └── request.ts                # リクエストごとのロケール解決
├── messages/
│   ├── ja.json                   # 日本語翻訳
│   └── en.json                   # 英語翻訳
├── public/                       # 静的アセット
├── docs/                         # ドキュメント
├── package.json
├── tsconfig.json
├── next.config.ts                # Next.js設定（next-intl統合）
├── postcss.config.mjs
└── eslint.config.mjs
```

### ルートグループの設計

Next.js の Route Groups を使い、公開画面と管理画面を分離している。

- `(public)` — 来店客向け画面。装飾のないシンプルなレイアウト
- `(admin)` — 店舗スタッフ向け画面。サイドバー付きレイアウト

両グループとも `[locale]` セグメントを持ち、多言語対応を実現する。

---

## 2. コンポーネント一覧

### ページコンポーネント

| コンポーネント | パス | 種別 | 説明 |
|----------------|------|------|------|
| `Home` | `(public)/[locale]/page.tsx` | Server | トップページ。商品一覧へのリンク |
| `ProductsPage` | `(public)/[locale]/products/page.tsx` | Server | 商品カード一覧 |
| `ProductPage` | `(public)/[locale]/products/[id]/page.tsx` | Server | 商品詳細ラッパー。モックデータから商品を検索 |
| `ProductDetailClient` | `(public)/[locale]/products/[id]/ProductDetailClient.tsx` | Client | 商品詳細UI。画像ギャラリー、バリエーション選択、試着/購入ボタン |
| `AdminProductsPage` | `(admin)/[locale]/admin/page.tsx` | Client | 管理画面の商品一覧テーブル |
| `AddProductPage` | `(admin)/[locale]/admin/products/new/page.tsx` | Client | 商品新規登録 |
| `EditProductPage` | `(admin)/[locale]/admin/products/[id]/edit/page.tsx` | Client | 商品編集 |
| `OrdersPage` | `(admin)/[locale]/admin/orders/page.tsx` | Client | 注文リクエスト一覧 |

### 共有コンポーネント

| コンポーネント | パス | 説明 |
|----------------|------|------|
| `ProductCard` | `app/components/ProductCard.tsx` | 商品一覧用カード。画像・名前・価格帯・バリエーション数を表示 |
| `ProductForm` | `components/admin/ProductForm.tsx` | 商品登録・編集の共通フォーム。基本情報・バリエーション・画像の入力UI |
| `QRCodeModal` | `components/admin/QRCodeModal.tsx` | QRコード表示・ダウンロード用モーダル |
| `AdminSidebar` | `app/(admin)/[locale]/admin/components/AdminSidebar.tsx` | 管理画面のサイドバー。未読通知バッジ付き |

### レイアウトコンポーネント

| コンポーネント | パス | 説明 |
|----------------|------|------|
| `LocaleLayout` | `(public)/[locale]/layout.tsx` | 公開画面のルートレイアウト。フォント・next-intl Provider |
| `AdminRootLayout` | `(admin)/[locale]/layout.tsx` | 管理画面のルートレイアウト。フォント・next-intl Provider |
| `AdminLayout` | `(admin)/[locale]/admin/layout.tsx` | 管理画面の内部レイアウト。サイドバー + メインコンテンツ |

---

## 3. 型定義

`types/index.ts` にデータモデルの型が定義されている。

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  sku: string;
  created_at: string;
  updated_at: string;
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

interface ProductWithDetails extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
}
```

### フォーム用型（ProductForm.tsx 内で定義）

```typescript
interface VariantFormData {
  name: string;
  size: string;
  color: string;
  price: string;   // フォーム入力のため文字列
  stock: string;    // フォーム入力のため文字列
  sku: string;
}

interface ImageFormData {
  image_url: string;
  alt_text: string;
  display_order: string;  // フォーム入力のため文字列
}

interface ProductFormData {
  name: string;
  description: string;
  variants: VariantFormData[];
  images: ImageFormData[];
}
```

---

## 4. API仕様

現在は Next.js の Route Handler でモックAPIを提供している。将来的にGoバックエンドに移行予定。

### `GET /api/orders`

全注文リクエストを取得する。

**レスポンス:** `200 OK`
```json
[
  {
    "id": 1710000000000,
    "productId": 1,
    "productName": "Premium Cotton T-Shirt",
    "variantId": 101,
    "variantName": "Size M / White",
    "type": "try-on",
    "deviceId": "uuid-string",
    "status": "pending",
    "read": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### `POST /api/orders`

新しい試着/購入リクエストを作成する。

**リクエストボディ:**
```json
{
  "productId": 1,
  "productName": "Premium Cotton T-Shirt",
  "variantId": 101,
  "variantName": "Size M / White",
  "type": "try-on",
  "deviceId": "uuid-string"
}
```

- `type` は `"try-on"` または `"purchase"`
- `deviceId` は来店客端末に紐づくUUID（`localStorage` で管理）

**レスポンス:**
- `200 OK` — 作成成功。作成されたオブジェクトを返す
- `429 Too Many Requests` — 同一端末から同一商品・バリエーション・タイプのリクエストが1分以内に再送された場合

**レート制限ロジック:**
同一 `deviceId` + `productId` + `variantId` + `type` の組み合わせで、直近1分以内のリクエストがある場合は429を返す。

### `PUT /api/orders`

全注文を既読にする。

**レスポンス:** `200 OK`
```json
{ "success": true }
```

> **注意:** 現在のAPIはインメモリストアを使用しており、サーバー再起動でデータは消失する。

---

## 5. 国際化（i18n）

`next-intl` を使用した多言語対応を実装している。

### 設定ファイル

| ファイル | 役割 |
|----------|------|
| `i18n/routing.ts` | 対応ロケール（`en`, `ja`）とデフォルトロケール（`ja`）の定義 |
| `i18n/request.ts` | リクエストごとのロケール解決と翻訳メッセージの読み込み |
| `messages/ja.json` | 日本語翻訳 |
| `messages/en.json` | 英語翻訳 |

### 翻訳キーの構成

```
Home        — トップページ
Products    — 商品一覧ページ
ProductDetail — 商品詳細ページ
Admin       — 管理画面全般
Common      — 共通（ローディング、エラー等）
```

### コンポーネントでの使い方

```typescript
import { useTranslations } from 'next-intl';

// クライアントコンポーネント
const t = useTranslations('Admin');
t('products')       // → "商品管理" (ja) / "Products" (en)
t('stock', { stock: 10 })  // → "在庫: 10" （パラメータ付き）
```

### ナビゲーション

`i18n/routing.ts` が提供する `Link`, `useRouter`, `usePathname`, `redirect` を使用する。標準の `next/link` は使わない。

```typescript
import { Link, useRouter } from '@/i18n/routing';

// ロケールを考慮したリンク
<Link href="/admin">管理画面</Link>
// → /ja/admin (日本語) or /en/admin (英語)
```

### 翻訳の追加方法

1. `messages/ja.json` と `messages/en.json` の両方に同じキーを追加する
2. コンポーネントで `useTranslations('セクション名')` を呼び出す
3. `t('キー名')` で翻訳テキストを取得する

---

## 6. スタイリング

### CSS設計

Tailwind CSS 4 をユーティリティファーストで使用。カスタムプロパティ（CSS変数）でテーマカラーを管理する。

`app/globals.css` で定義されているテーマ変数:

| 変数 | 値 | 用途 |
|------|-----|------|
| `--background` | `#f8fafc` | ページ背景 |
| `--foreground` | `#0f172a` | テキスト色 |
| `--primary` | `#0f172a` | プライマリーカラー |
| `--primary-foreground` | `#ffffff` | プライマリー上のテキスト |
| `--muted` | `#f1f5f9` | 控えめな背景色 |
| `--muted-foreground` | `#64748b` | 控えめなテキスト色 |
| `--accent` | `#e2e8f0` | アクセント背景 |
| `--border` | `#cbd5e1` | ボーダー色 |

Tailwindの `@theme inline` ディレクティブでCSS変数をTailwindユーティリティクラスとして使用可能にしている。

### よく使うパターン

```tsx
// カード
"bg-white border border-border rounded-xl shadow-sm"

// ボタン（プライマリー）
"bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"

// ボタン（アウトライン）
"border-2 border-primary text-primary rounded-full hover:bg-primary/5"

// テーブルヘッダー
"bg-muted/50 border-b border-border"

// バッジ（成功）
"bg-green-100 text-green-800 rounded-full text-xs font-medium px-2.5 py-0.5"
```

---

## 7. モックデータ

`lib/mockData.ts` に開発用のモックデータが定義されている。

現在2つの商品が登録されている:
1. **Premium Cotton T-Shirt** — 3バリエーション（M/White, L/White, M/Black）、2画像
2. **Slim Fit Jeans** — 1バリエーション（30/Blue）、1画像

画像はUnsplashの外部URLを使用している。`next.config.ts` の `images.remotePatterns` で `images.unsplash.com` を許可している。

---

## 8. 開発時の注意事項

### パスエイリアス

`tsconfig.json` で `@/*` が設定されており、プロジェクトルートからの絶対パスでインポートできる。

```typescript
import { ProductWithDetails } from '@/types';
import { mockProducts } from '@/lib/mockData';
import { Link } from '@/i18n/routing';
```

### サーバー/クライアントコンポーネントの使い分け

- `'use client'` ディレクティブが必要なケース: `useState`, `useEffect`, イベントハンドラ、`useTranslations` を使用するコンポーネント
- サーバーコンポーネントで十分なケース: データ取得のみ、静的な表示のみ

### 外部画像の追加

新しい画像ホスト（Unsplash以外）を使う場合は、`next.config.ts` の `images.remotePatterns` に追加が必要。

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'new-host.example.com' },  // 追加
    ],
  },
};
```
