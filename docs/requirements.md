# 必要要件 

- 店舗商品管理を簡略化、説明を自動化
- 試着・購入の通知で人件費コストを削減

## システム構成 (Tech Stack)
- **Frontend**: Next.js (React)
- **Backend**: Go
- **Database**: PostgreSQL
- **ORM**: Bun (Go)


## フロントエンド-管理画面
- 商品を一覧表示する
- 商品を登録する
- 商品を編集する
- 商品を削除する
- 商品の印刷用QRコードを表示する

## フロントエンド-商品表示画面
- クエリ付きのページを表示する
  - APIで商品詳細情報を取得する
  - 商品詳細情報を表示する
  - 試着ボタンでAPI経由で管理画面に通知する
  - 購入ボタンでAPI経由で管理画面に通知する



## API
- 商品一覧取得
- 商品詳細取得
- 商品登録
- 商品編集
- 商品削除
- 試着通知
- 購入通知

### Models
- product: 商品
    - id: 商品ID (BigInt)
    - name: 商品名
    - description: 説明
    - qr_code: QRコード
    - created_at: 作成日時
    - updated_at: 更新日時
- product_variant: 商品バリエーション
    - id: バリエーションID (BigInt)
    - product_id: 商品ID (FK)
    - name: バリエーション名
    - size: サイズ
    - color: 色
    - price: 価格
    - stock: 在庫
    - sku: SKU
    - created_at: 作成日時
    - updated_at: 更新日時
- product_image: 商品画像
    - id: 画像ID (BigInt)
    - product_id: 商品ID (FK)
    - image_url: 画像URL
    - alt_text: 代替テキスト
    - display_order: 表示順
    - created_at: 作成日時
- manager: 管理者
    - id: 管理者ID
    - name: 管理者名
    - email: メールアドレス
    - password: パスワード
    - created_at: 作成日時
    - updated_at: 更新日時

