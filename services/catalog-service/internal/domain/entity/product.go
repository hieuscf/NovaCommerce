package entity

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Product maps to the products table.
type Product struct {
	ID          uuid.UUID       `db:"id" json:"id"`
	SellerID    uuid.UUID       `db:"seller_id" json:"seller_id"`
	CategoryID  uuid.UUID       `db:"category_id" json:"category_id"`
	BrandID     *uuid.UUID      `db:"brand_id" json:"brand_id,omitempty"`
	Name        string          `db:"name" json:"name"`
	Slug        string          `db:"slug" json:"slug"`
	Description string          `db:"description" json:"description,omitempty"`
	Status      ProductStatus   `db:"status" json:"status"`
	BasePrice   float64         `db:"base_price" json:"base_price"`
	Currency    string          `db:"currency" json:"currency"`
	Metadata    json.RawMessage `db:"metadata" json:"metadata,omitempty"`
	CreatedAt   time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time       `db:"updated_at" json:"updated_at"`
	Variants    []*ProductVariant `db:"-" json:"variants,omitempty"`
	Images      []*ProductImage   `db:"-" json:"images,omitempty"`
}

// IsOwnedBy reports whether the product belongs to the given seller.
func (p *Product) IsOwnedBy(sellerID uuid.UUID) bool {
	return p.SellerID == sellerID
}

// IsArchived reports whether the product has been soft-deleted via status.
func (p *Product) IsArchived() bool {
	return p.Status == ProductStatusArchived
}

// CanBeArchived reports whether the product may transition directly to archived status.
func (p *Product) CanBeArchived() bool {
	return p.Status == ProductStatusDraft
}
