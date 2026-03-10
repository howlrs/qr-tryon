package model

import (
	"time"

	"github.com/uptrace/bun"
)

type Product struct {
	bun.BaseModel `bun:"table:products"`
	ID            int64            `bun:"id,pk,autoincrement" json:"id"`
	Name          string           `bun:"name,notnull" json:"name"`
	Description   string           `bun:"description,notnull,default:''" json:"description"`
	CreatedAt     time.Time        `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt     time.Time        `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
	Variants      []ProductVariant `bun:"rel:has-many,join:id=product_id" json:"variants,omitempty"`
	Images        []ProductImage   `bun:"rel:has-many,join:id=product_id" json:"images,omitempty"`
}

type ProductVariant struct {
	bun.BaseModel `bun:"table:product_variants"`
	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	ProductID     int64     `bun:"product_id,notnull" json:"product_id"`
	Name          string    `bun:"name,notnull" json:"name"`
	Size          *string   `bun:"size" json:"size"`
	Color         *string   `bun:"color" json:"color"`
	Price         int       `bun:"price,notnull" json:"price"`
	Stock         int       `bun:"stock,notnull,default:0" json:"stock"`
	SKU           string    `bun:"sku,notnull,unique" json:"sku"`
	CreatedAt     time.Time `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt     time.Time `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
}

type ProductImage struct {
	bun.BaseModel `bun:"table:product_images"`
	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	ProductID     int64     `bun:"product_id,notnull" json:"product_id"`
	ImageURL      string    `bun:"image_url,notnull" json:"image_url"`
	AltText       *string   `bun:"alt_text" json:"alt_text"`
	DisplayOrder  int       `bun:"display_order,notnull,default:0" json:"display_order"`
	CreatedAt     time.Time `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
}
