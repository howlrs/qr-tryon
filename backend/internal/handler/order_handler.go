package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/howlrs/qr-tryon/backend/internal/dto"
	"github.com/howlrs/qr-tryon/backend/internal/service"
)

type OrderHandler struct {
	svc *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
		return
	}

	if req.ProductID == 0 || req.VariantID == 0 || req.Type == "" {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "product_id, variant_id, and type are required")
		return
	}

	order, err := h.svc.Create(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidOrderType) {
			writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
			return
		}
		if errors.Is(err, service.ErrOutOfStock) {
			writeError(w, http.StatusConflict, "OUT_OF_STOCK", "variant is out of stock")
			return
		}
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, order)
}

func (h *OrderHandler) List(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	status := r.URL.Query().Get("status")

	params := dto.OrderListParams{
		Status: status,
		Page:   page,
		Limit:  limit,
	}

	orders, total, err := h.svc.List(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list orders")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"orders": orders,
		"total":  total,
		"page":   params.Page,
		"limit":  params.Limit,
	})
}

func (h *OrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid order id")
		return
	}

	var req dto.UpdateOrderStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
		return
	}

	order, err := h.svc.UpdateStatus(r.Context(), id, req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidStatusTransition) {
			writeError(w, http.StatusBadRequest, "INVALID_TRANSITION", err.Error())
			return
		}
		if errors.Is(err, service.ErrAssignedToRequired) {
			writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
			return
		}
		if errors.Is(err, service.ErrStockDecrementFailed) {
			writeError(w, http.StatusConflict, "OUT_OF_STOCK", "insufficient stock")
			return
		}
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, order)
}

func (h *OrderHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.MarkAllRead(r.Context()); err != nil {
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to mark orders as read")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
