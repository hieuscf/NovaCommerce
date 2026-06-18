package handler

// CreateProductRequest is the HTTP payload for creating a product.
type CreateProductRequest struct {
	Name        string             `json:"name" validate:"required,min=3,max=255"`
	Description string             `json:"description" validate:"max=5000"`
	CategoryID  string             `json:"category_id" validate:"required,uuid4"`
	BrandID     string             `json:"brand_id" validate:"omitempty,uuid4"`
	Variants    []CreateVariantReq `json:"variants" validate:"required,min=1,dive"`
}

// CreateVariantReq is a variant payload within create product request.
type CreateVariantReq struct {
	SKU          string            `json:"sku" validate:"required,min=1,max=100"`
	Price        float64           `json:"price" validate:"required,gt=0"`
	ComparePrice *float64          `json:"compare_price" validate:"omitempty,gt=0"`
	Weight       *float64          `json:"weight" validate:"omitempty,gt=0"`
	Attributes   map[string]string `json:"attributes"`
}

// UpdateProductRequest is the HTTP payload for updating a product.
type UpdateProductRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=3,max=255"`
	Description *string `json:"description" validate:"omitempty,max=5000"`
	CategoryID  *string `json:"category_id" validate:"omitempty,uuid4"`
	BrandID     *string `json:"brand_id" validate:"omitempty,uuid4"`
	Status      *string `json:"status" validate:"omitempty,oneof=draft active inactive"`
}

// ListProductsQuery holds list endpoint query parameters.
type ListProductsQuery struct {
	CategoryID string  `form:"category_id" validate:"omitempty,uuid4"`
	BrandID    string  `form:"brand_id" validate:"omitempty,uuid4"`
	SellerID   string  `form:"seller_id" validate:"omitempty,uuid4"`
	MinPrice   float64 `form:"min_price" validate:"omitempty,gte=0"`
	MaxPrice   float64 `form:"max_price" validate:"omitempty,gte=0"`
	Status     string  `form:"status" validate:"omitempty,oneof=draft active inactive archived"`
	Search     string  `form:"q" validate:"omitempty,max=200"`
	Cursor     string  `form:"cursor"`
	Limit      int     `form:"limit" validate:"omitempty,min=1,max=100"`
}

// AddVariantRequest is the HTTP payload for adding a variant.
type AddVariantRequest struct {
	SKU          string            `json:"sku" validate:"required,min=1,max=100"`
	Price        float64           `json:"price" validate:"required,gt=0"`
	ComparePrice *float64          `json:"compare_price" validate:"omitempty,gt=0"`
	Weight       *float64          `json:"weight" validate:"omitempty,gt=0"`
	Attributes   map[string]string `json:"attributes"`
}

// UpdateVariantRequest is the HTTP payload for updating a variant.
type UpdateVariantRequest struct {
	Price        *float64 `json:"price" validate:"omitempty,gt=0"`
	ComparePrice *float64 `json:"compare_price" validate:"omitempty,gt=0"`
	Weight       *float64 `json:"weight" validate:"omitempty,gt=0"`
	Status       *string  `json:"status" validate:"omitempty,oneof=active inactive"`
}

// AddImageRequest is the HTTP payload for adding a product image.
type AddImageRequest struct {
	FileKey  string `json:"file_key" validate:"required"`
	AltText  string `json:"alt_text" validate:"max=255"`
	Position int    `json:"position" validate:"gte=0"`
}
