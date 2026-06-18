package entity

import (
	"time"

	"github.com/google/uuid"
)

// Warehouse maps to the warehouses table.
type Warehouse struct {
	ID        uuid.UUID `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Code      string    `db:"code" json:"code"`
	Address   string    `db:"address" json:"address,omitempty"`
	City      string    `db:"city" json:"city,omitempty"`
	IsActive  bool      `db:"is_active" json:"is_active"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
