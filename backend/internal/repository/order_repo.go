package repository

import (
	"context"

	"github.com/howlrs/qr-tryon/backend/internal/dto"
	"github.com/howlrs/qr-tryon/backend/internal/model"
	"github.com/uptrace/bun"
)

type OrderRepository struct {
	db *bun.DB
}

func NewOrderRepository(db *bun.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(ctx context.Context, order *model.Order) error {
	_, err := r.db.NewInsert().Model(order).Exec(ctx)
	return err
}

func (r *OrderRepository) GetByID(ctx context.Context, id int64) (*model.Order, error) {
	order := new(model.Order)
	err := r.db.NewSelect().
		Model(order).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return order, nil
}

func (r *OrderRepository) List(ctx context.Context, params dto.OrderListParams) ([]model.Order, int, error) {
	var orders []model.Order
	q := r.db.NewSelect().Model(&orders)

	if params.Status != "" {
		q = q.Where("status = ?", params.Status)
	}

	count, err := q.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	offset := (params.Page - 1) * params.Limit
	err = q.OrderExpr("created_at DESC").
		Limit(params.Limit).
		Offset(offset).
		Scan(ctx)
	return orders, count, err
}

func (r *OrderRepository) Update(ctx context.Context, order *model.Order) error {
	_, err := r.db.NewUpdate().
		Model(order).
		WherePK().
		Exec(ctx)
	return err
}

func (r *OrderRepository) MarkAllRead(ctx context.Context) error {
	_, err := r.db.NewUpdate().
		Model((*model.Order)(nil)).
		Set("read = true").
		Where("read = false").
		Exec(ctx)
	return err
}
