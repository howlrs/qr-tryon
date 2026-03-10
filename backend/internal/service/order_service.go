package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/howlrs/qr-tryon/backend/internal/dto"
	"github.com/howlrs/qr-tryon/backend/internal/model"
	"github.com/howlrs/qr-tryon/backend/internal/repository"
)

var (
	ErrInvalidOrderType       = errors.New("invalid order type: must be 'try-on' or 'purchase'")
	ErrInvalidStatusTransition = errors.New("invalid status transition")
	ErrAssignedToRequired     = errors.New("assigned_to is required for confirmed status")
	ErrOutOfStock             = errors.New("variant is out of stock")
	ErrStockDecrementFailed   = errors.New("failed to decrement stock")
)

type OrderService struct {
	orderRepo      *repository.OrderRepository
	productRepo    *repository.ProductRepository
	notificationSvc *NotificationService
	stockThreshold int
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	productRepo *repository.ProductRepository,
	notificationSvc *NotificationService,
	stockThreshold int,
) *OrderService {
	return &OrderService{
		orderRepo:      orderRepo,
		productRepo:    productRepo,
		notificationSvc: notificationSvc,
		stockThreshold: stockThreshold,
	}
}

func (s *OrderService) Create(ctx context.Context, req dto.CreateOrderRequest) (*model.Order, error) {
	if req.Type != model.OrderTypeTryOn && req.Type != model.OrderTypePurchase {
		return nil, ErrInvalidOrderType
	}

	// Get product info
	product, err := s.productRepo.GetByID(ctx, req.ProductID)
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// Get variant info
	variant, err := s.productRepo.GetVariantByID(ctx, req.VariantID)
	if err != nil {
		return nil, fmt.Errorf("variant not found: %w", err)
	}

	// Check variant belongs to product
	if variant.ProductID != product.ID {
		return nil, fmt.Errorf("variant does not belong to product")
	}

	// For purchase orders, check stock
	if req.Type == model.OrderTypePurchase && variant.Stock <= 0 {
		return nil, ErrOutOfStock
	}

	now := time.Now()
	order := &model.Order{
		ProductID:   req.ProductID,
		VariantID:   req.VariantID,
		ProductName: product.Name,
		VariantName: variant.Name,
		Type:        req.Type,
		Status:      model.OrderStatusPending,
		Read:        false,
		DeviceID:    req.DeviceID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// Broadcast new order event
	s.notificationSvc.Broadcast(Event{
		Type: EventNewOrder,
		Data: order,
	})

	return order, nil
}

func (s *OrderService) List(ctx context.Context, params dto.OrderListParams) ([]model.Order, int, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 || params.Limit > 100 {
		params.Limit = 20
	}
	return s.orderRepo.List(ctx, params)
}

func (s *OrderService) UpdateStatus(ctx context.Context, id int64, req dto.UpdateOrderStatusRequest) (*model.Order, error) {
	order, err := s.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Validate transition
	if !s.isValidTransition(order.Status, req.Status) {
		return nil, fmt.Errorf("%w: %s -> %s", ErrInvalidStatusTransition, order.Status, req.Status)
	}

	now := time.Now()
	order.UpdatedAt = now

	switch req.Status {
	case model.OrderStatusConfirmed:
		if req.AssignedTo == nil {
			return nil, ErrAssignedToRequired
		}
		order.Status = model.OrderStatusConfirmed
		order.AssignedTo = req.AssignedTo
		order.ConfirmedAt = &now

	case model.OrderStatusCompleted:
		order.Status = model.OrderStatusCompleted
		order.CompletedAt = &now

		// Decrement stock for purchase orders
		if order.Type == model.OrderTypePurchase {
			newStock, err := s.productRepo.DecrementStock(ctx, order.VariantID)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return nil, ErrStockDecrementFailed
				}
				return nil, err
			}

			// Check stock threshold
			if newStock <= s.stockThreshold {
				s.notificationSvc.Broadcast(Event{
					Type: EventStockAlert,
					Data: map[string]interface{}{
						"variant_id":   order.VariantID,
						"product_name": order.ProductName,
						"variant_name": order.VariantName,
						"stock":        newStock,
					},
				})
			}
		}

	case model.OrderStatusCancelled:
		order.Status = model.OrderStatusCancelled
		order.CancelledAt = &now
		order.CancelReason = req.CancelReason
	}

	if err := s.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	// Broadcast status change event
	s.notificationSvc.Broadcast(Event{
		Type: EventStatusChanged,
		Data: order,
	})

	return order, nil
}

func (s *OrderService) MarkAllRead(ctx context.Context) error {
	return s.orderRepo.MarkAllRead(ctx)
}

func (s *OrderService) isValidTransition(from, to string) bool {
	switch from {
	case model.OrderStatusPending:
		return to == model.OrderStatusConfirmed || to == model.OrderStatusCancelled
	case model.OrderStatusConfirmed:
		return to == model.OrderStatusCompleted || to == model.OrderStatusCancelled
	default:
		return false
	}
}
