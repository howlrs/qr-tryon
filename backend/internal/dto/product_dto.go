package dto

type CreateProductRequest struct {
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Variants    []CreateVariantRequest  `json:"variants"`
	Images      []CreateImageRequest    `json:"images"`
}

type CreateVariantRequest struct {
	Name  string  `json:"name"`
	Size  *string `json:"size"`
	Color *string `json:"color"`
	Price int     `json:"price"`
	Stock int     `json:"stock"`
	SKU   string  `json:"sku"`
}

type CreateImageRequest struct {
	ImageURL     string  `json:"image_url"`
	AltText      *string `json:"alt_text"`
	DisplayOrder int     `json:"display_order"`
}

type UpdateProductRequest struct {
	Name        *string                 `json:"name"`
	Description *string                 `json:"description"`
	Variants    []UpdateVariantRequest  `json:"variants"`
	Images      []CreateImageRequest    `json:"images"`
}

type UpdateVariantRequest struct {
	ID    *int64  `json:"id"`
	Name  string  `json:"name"`
	Size  *string `json:"size"`
	Color *string `json:"color"`
	Price int     `json:"price"`
	Stock int     `json:"stock"`
	SKU   string  `json:"sku"`
}
