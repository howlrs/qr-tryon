package model

import (
	"time"

	"github.com/uptrace/bun"
)

type Manager struct {
	bun.BaseModel `bun:"table:managers"`
	ID            int64     `bun:"id,pk,autoincrement" json:"id"`
	Email         string    `bun:"email,notnull,unique" json:"email"`
	PasswordHash  string    `bun:"password_hash,notnull" json:"-"`
	Name          string    `bun:"name,notnull" json:"name"`
	CreatedAt     time.Time `bun:"created_at,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt     time.Time `bun:"updated_at,notnull,default:current_timestamp" json:"updated_at"`
}
