package service

import (
	"context"
	"time"

	"github.com/howlrs/qr-tryon/backend/internal/dto"
	"github.com/howlrs/qr-tryon/backend/internal/model"
	"github.com/howlrs/qr-tryon/backend/internal/repository"
)

type ProductService struct {
	repo *repository.ProductRepository
}

func NewProductService(repo *repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) List(ctx context.Context) ([]model.Product, error) {
	return s.repo.List(ctx)
}

func (s *ProductService) GetByID(ctx context.Context, id int64) (*model.Product, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ProductService) Create(ctx context.Context, req dto.CreateProductRequest) (*model.Product, error) {
	now := time.Now()
	product := &model.Product{
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	for _, v := range req.Variants {
		product.Variants = append(product.Variants, model.ProductVariant{
			Name:      v.Name,
			Size:      v.Size,
			Color:     v.Color,
			Price:     v.Price,
			Stock:     v.Stock,
			SKU:       v.SKU,
			CreatedAt: now,
			UpdatedAt: now,
		})
	}

	for _, img := range req.Images {
		product.Images = append(product.Images, model.ProductImage{
			ImageURL:     img.ImageURL,
			AltText:      img.AltText,
			DisplayOrder: img.DisplayOrder,
			CreatedAt:    now,
		})
	}

	if err := s.repo.Create(ctx, product); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, product.ID)
}

func (s *ProductService) Update(ctx context.Context, id int64, req dto.UpdateProductRequest) (*model.Product, error) {
	product, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	product.UpdatedAt = now

	product.Variants = nil
	for _, v := range req.Variants {
		product.Variants = append(product.Variants, model.ProductVariant{
			Name:      v.Name,
			Size:      v.Size,
			Color:     v.Color,
			Price:     v.Price,
			Stock:     v.Stock,
			SKU:       v.SKU,
			CreatedAt: now,
			UpdatedAt: now,
		})
	}

	product.Images = nil
	for _, img := range req.Images {
		product.Images = append(product.Images, model.ProductImage{
			ImageURL:     img.ImageURL,
			AltText:      img.AltText,
			DisplayOrder: img.DisplayOrder,
			CreatedAt:    now,
		})
	}

	if err := s.repo.Update(ctx, product); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, product.ID)
}

func (s *ProductService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}
