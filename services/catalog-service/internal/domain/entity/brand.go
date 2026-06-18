package entity

import (
	"time"

	"github.com/google/uuid"
)

// Brand represents a product brand.
type Brand struct {
	ID          uuid.UUID   `db:"id" json:"id"`
	Name        string      `db:"name" json:"name"`
	Slug        string      `db:"slug" json:"slug"`
	LogoURL     string      `db:"logo_url" json:"logo_url,omitempty"`
	Description string      `db:"description" json:"description,omitempty"`
	Status      BrandStatus `db:"status" json:"status"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updated_at"`
}

// IsActive reports whether the brand is visible in the catalog.
func (b *Brand) IsActive() bool {
	return b.Status == BrandStatusActive
}
