package entity

import (
	"time"

	"github.com/google/uuid"
)

// ProductImage maps to the product_images table.
type ProductImage struct {
	ID        uuid.UUID `db:"id" json:"id"`
	ProductID uuid.UUID `db:"product_id" json:"product_id"`
	URL       string    `db:"url" json:"url"`
	AltText   string    `db:"alt_text" json:"alt_text,omitempty"`
	Position  int       `db:"position" json:"position"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
