package application

import (
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// CreateProductInput is the request payload for creating a product.
type CreateProductInput struct {
	Name        string
	Description string
	CategoryID  uuid.UUID
	BrandID     *uuid.UUID
	Variants    []CreateVariantInput
}

// CreateVariantInput is the request payload for an initial product variant.
type CreateVariantInput struct {
	SKU          string
	Price        float64
	ComparePrice *float64
	Weight       *float64
	Attributes   map[uuid.UUID]uuid.UUID
}

// UpdateProductInput carries partial product updates; nil fields are ignored.
type UpdateProductInput struct {
	Name        *string
	Description *string
	CategoryID  *uuid.UUID
	BrandID     *uuid.UUID
	Status      *entity.ProductStatus
}

// AddVariantInput is the request payload for adding a variant to a product.
type AddVariantInput struct {
	SKU          string
	Price        float64
	ComparePrice *float64
	Weight       *float64
	Attributes   map[uuid.UUID]uuid.UUID
}

// UpdateVariantInput carries partial variant updates; nil fields are ignored.
type UpdateVariantInput struct {
	Price        *float64
	ComparePrice *float64
	Weight       *float64
	Status       *entity.ProductStatus
}

// AddImageInput is the request payload for adding a product image.
type AddImageInput struct {
	FileKey  string
	AltText  string
	Position int
}

// ProductOutput is the product detail response DTO.
type ProductOutput struct {
	ID          uuid.UUID
	SellerID    uuid.UUID
	CategoryID  uuid.UUID
	BrandID     *uuid.UUID
	Name        string
	Slug        string
	Description string
	Status      string
	Variants    []VariantOutput
	Images      []ImageOutput
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// VariantOutput is a product variant response DTO.
type VariantOutput struct {
	ID           uuid.UUID
	SKU          string
	Price        float64
	ComparePrice *float64
	Weight       *float64
	Status       string
	Attributes   []AttributeOutput
}

// AttributeOutput is a variant attribute response DTO.
type AttributeOutput struct {
	Name  string
	Value string
}

// ImageOutput is a product image response DTO.
type ImageOutput struct {
	ID       uuid.UUID
	URL      string
	AltText  string
	Position int
}

// ProductListOutput is a paginated product list response DTO.
type ProductListOutput struct {
	Items      []ProductOutput
	Total      int64
	NextCursor string
}
