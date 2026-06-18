package entity

import (
	"time"

	"github.com/google/uuid"
)

// ProductVariant maps to the product_variants table.
type ProductVariant struct {
	ID             uuid.UUID            `db:"id" json:"id"`
	ProductID      uuid.UUID            `db:"product_id" json:"product_id"`
	SKU            string               `db:"sku" json:"sku"`
	Price          float64              `db:"price" json:"price"`
	CompareAtPrice *float64             `db:"compare_at_price" json:"compare_at_price,omitempty"`
	Status         ProductVariantStatus `db:"status" json:"status"`
	CreatedAt      time.Time            `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time            `db:"updated_at" json:"updated_at"`
	AttributeValues []*VariantAttributeValue `db:"-" json:"attribute_values,omitempty"`
}
