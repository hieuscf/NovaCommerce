package domain

import (
	"time"

	"github.com/google/uuid"
)

// Category represents a node in the product category tree.
type Category struct {
	ID          uuid.UUID
	ParentID    *uuid.UUID
	Name        string
	Slug        string
	Description string
	ImageURL    string
	SortOrder   int
	IsActive    bool
	Children    []*Category
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// HasChildren reports whether the category has child nodes in the in-memory tree.
func (c *Category) HasChildren() bool {
	return len(c.Children) > 0
}
