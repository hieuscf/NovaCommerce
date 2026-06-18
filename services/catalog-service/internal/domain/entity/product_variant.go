package entity

import (
	"time"

	"github.com/google/uuid"
)

// ProductVariant maps to the product_variants table.
type ProductVariant struct {
	ID           uuid.UUID           `db:"id" json:"id"`
	ProductID    uuid.UUID           `db:"product_id" json:"product_id"`
	SKU          string              `db:"sku" json:"sku"`
	Price        float64             `db:"price" json:"price"`
	ComparePrice *float64            `db:"compare_price" json:"compare_price,omitempty"`
	Weight       *float64            `db:"weight" json:"weight,omitempty"`
	Status       ProductStatus       `db:"status" json:"status"`
	Attributes   []*VariantAttribute `db:"-" json:"attributes,omitempty"`
	CreatedAt    time.Time           `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time           `db:"updated_at" json:"updated_at"`
}
