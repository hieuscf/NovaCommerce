package entity

import (
	"time"

	"github.com/google/uuid"
)

// Category represents a node in the product category tree.
type Category struct {
	ID          uuid.UUID      `db:"id" json:"id"`
	ParentID    *uuid.UUID     `db:"parent_id" json:"parent_id,omitempty"`
	Name        string         `db:"name" json:"name"`
	Slug        string         `db:"slug" json:"slug"`
	Description string         `db:"description" json:"description,omitempty"`
	ImageURL    string         `db:"image_url" json:"image_url,omitempty"`
	SortOrder   int            `db:"sort_order" json:"sort_order"`
	Status      CategoryStatus `db:"status" json:"status"`
	CreatedAt   time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at" json:"updated_at"`
	Children    []*Category    `db:"-" json:"children,omitempty"`
}

// IsActive reports whether the category is visible in the catalog.
func (c *Category) IsActive() bool {
	return c.Status == CategoryStatusActive
}

// HasChildren reports whether the category has child nodes in the in-memory tree.
func (c *Category) HasChildren() bool {
	return len(c.Children) > 0
}
