package domain

import (
	"time"

	"github.com/google/uuid"
)

// Brand represents a product brand.
type Brand struct {
	ID          uuid.UUID
	Name        string
	Slug        string
	Description string
	LogoURL     string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
