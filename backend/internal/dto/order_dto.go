package dto

type CreateOrderRequest struct {
	ProductID int64   `json:"product_id"`
	VariantID int64   `json:"variant_id"`
	Type      string  `json:"type"`
	DeviceID  *string `json:"device_id,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status       string  `json:"status"`
	AssignedTo   *int64  `json:"assigned_to,omitempty"`
	CancelReason *string `json:"cancel_reason,omitempty"`
}

type OrderListParams struct {
	Status string
	Page   int
	Limit  int
}
