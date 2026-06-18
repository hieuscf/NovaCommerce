package entity

import (
	"time"

	"github.com/google/uuid"
)

// ProductImage maps to the product_images table.
type ProductImage struct {
	ID        uuid.UUID `db:"id" json:"id"`
	ProductID uuid.UUID `db:"product_id" json:"product_id"`
	ImageURL  string    `db:"image_url" json:"image_url"`
	SortOrder int       `db:"sort_order" json:"sort_order"`
	IsPrimary bool      `db:"is_primary" json:"is_primary"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
