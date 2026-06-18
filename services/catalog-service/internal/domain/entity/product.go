package entity

import (
	"time"

	"github.com/google/uuid"
)

// ProductStatus is the lifecycle state of a product or variant.
type ProductStatus string

const (
	ProductStatusDraft    ProductStatus = "draft"
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
	ProductStatusArchived ProductStatus = "archived"
)

// Product maps to the products table.
type Product struct {
	ID          uuid.UUID
	SellerID    uuid.UUID
	CategoryID  uuid.UUID
	BrandID     *uuid.UUID
	Name        string
	Slug        string
	Description string
	Status      ProductStatus
	Variants    []*ProductVariant
	Images      []*ProductImage
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}

// ProductVariant maps to the product_variants table.
type ProductVariant struct {
	ID           uuid.UUID
	ProductID    uuid.UUID
	SKU          string
	Price        float64
	ComparePrice *float64
	Weight       *float64
	Status       ProductStatus
	Attributes   []*VariantAttribute
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// ProductImage maps to the product_images table.
type ProductImage struct {
	ID        uuid.UUID
	ProductID uuid.UUID
	URL       string
	AltText   string
	Position  int
	CreatedAt time.Time
}

// VariantAttribute is an attribute value assigned to a variant.
type VariantAttribute struct {
	AttributeID   uuid.UUID
	AttributeName string
	ValueID       uuid.UUID
	Value         string
}
