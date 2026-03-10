package model

import (
	"time"

	"github.com/uptrace/bun"
)

type Order struct {
	bun.BaseModel `bun:"table:orders"`
	ID            int64      `bun:"id,pk,autoincrement" json:"id"`
	ProductID     int64      `bun:"product_id,notnull" json:"product_id"`
	VariantID     int64      `bun:"variant_id,notnull" json:"variant_id"`
	ProductName   string     `bun:"product_name,notnull" json:"product_name"`
	VariantName   string     `bun:"variant_name,notnull" json:"variant_name"`
	Type          string     `bun:"type,notnull" json:"type"`
	Status        string     `bun:"status,notnull,default:'pending'" json:"status"`
	Read          bool       `bun:"read,notnull,default:false" json:"read"`
	DeviceID      *string    `bun:"device_id" json:"device_id,omitempty"`
	AssignedTo    *int64     `bun:"assigned_to" json:"assigned_to,omitempty"`
	ConfirmedAt   *time.Time `bun:"confirmed_at" json:"confirmed_at,omitempty"`
	CompletedAt   *time.Time `bun:"completed_at" json:"completed_at,omitempty"`
	CancelledAt   *time.Time `bun:"cancelled_at" json:"cancelled_at,omitempty"`
	CancelReason  *string    `bun:"cancel_reason" json:"cancel_reason,omitempty"`
	CreatedAt     time.Time  `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt     time.Time  `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
}

const (
	OrderTypeTryOn    = "try-on"
	OrderTypePurchase = "purchase"

	OrderStatusPending   = "pending"
	OrderStatusConfirmed = "confirmed"
	OrderStatusCompleted = "completed"
	OrderStatusCancelled = "cancelled"
)
