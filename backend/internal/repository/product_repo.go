package repository

import (
	"context"
	"database/sql"

	"github.com/howlrs/qr-tryon/backend/internal/model"
	"github.com/uptrace/bun"
)

type ProductRepository struct {
	db *bun.DB
}

func NewProductRepository(db *bun.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) List(ctx context.Context) ([]model.Product, error) {
	var products []model.Product
	err := r.db.NewSelect().
		Model(&products).
		Relation("Variants").
		Relation("Images").
		OrderExpr("product.id ASC").
		Scan(ctx)
	return products, err
}

func (r *ProductRepository) GetByID(ctx context.Context, id int64) (*model.Product, error) {
	product := new(model.Product)
	err := r.db.NewSelect().
		Model(product).
		Where("product.id = ?", id).
		Relation("Variants").
		Relation("Images").
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (r *ProductRepository) Create(ctx context.Context, product *model.Product) error {
	return r.db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		_, err := tx.NewInsert().Model(product).Exec(ctx)
		if err != nil {
			return err
		}
		if len(product.Variants) > 0 {
			for i := range product.Variants {
				product.Variants[i].ProductID = product.ID
			}
			_, err = tx.NewInsert().Model(&product.Variants).Exec(ctx)
			if err != nil {
				return err
			}
		}
		if len(product.Images) > 0 {
			for i := range product.Images {
				product.Images[i].ProductID = product.ID
			}
			_, err = tx.NewInsert().Model(&product.Images).Exec(ctx)
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *ProductRepository) Update(ctx context.Context, product *model.Product) error {
	return r.db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		_, err := tx.NewUpdate().
			Model(product).
			WherePK().
			Column("name", "description", "updated_at").
			Exec(ctx)
		if err != nil {
			return err
		}

		// Delete existing variants and images, then re-insert
		_, err = tx.NewDelete().
			Model((*model.ProductVariant)(nil)).
			Where("product_id = ?", product.ID).
			Exec(ctx)
		if err != nil {
			return err
		}
		if len(product.Variants) > 0 {
			for i := range product.Variants {
				product.Variants[i].ProductID = product.ID
			}
			_, err = tx.NewInsert().Model(&product.Variants).Exec(ctx)
			if err != nil {
				return err
			}
		}

		_, err = tx.NewDelete().
			Model((*model.ProductImage)(nil)).
			Where("product_id = ?", product.ID).
			Exec(ctx)
		if err != nil {
			return err
		}
		if len(product.Images) > 0 {
			for i := range product.Images {
				product.Images[i].ProductID = product.ID
			}
			_, err = tx.NewInsert().Model(&product.Images).Exec(ctx)
			if err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *ProductRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.NewDelete().
		Model((*model.Product)(nil)).
		Where("id = ?", id).
		Exec(ctx)
	return err
}

func (r *ProductRepository) GetVariantByID(ctx context.Context, variantID int64) (*model.ProductVariant, error) {
	variant := new(model.ProductVariant)
	err := r.db.NewSelect().
		Model(variant).
		Where("id = ?", variantID).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return variant, nil
}

func (r *ProductRepository) DecrementStock(ctx context.Context, variantID int64) (int, error) {
	var stock int
	err := r.db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		res, err := tx.NewUpdate().
			Model((*model.ProductVariant)(nil)).
			Set("stock = stock - 1").
			Set("updated_at = current_timestamp").
			Where("id = ?", variantID).
			Where("stock >= 1").
			Exec(ctx)
		if err != nil {
			return err
		}
		rows, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if rows == 0 {
			return sql.ErrNoRows
		}
		// Get the updated stock
		variant := new(model.ProductVariant)
		err = tx.NewSelect().
			Model(variant).
			Column("stock").
			Where("id = ?", variantID).
			Scan(ctx)
		if err != nil {
			return err
		}
		stock = variant.Stock
		return nil
	})
	return stock, err
}
