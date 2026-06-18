package repository

import (
	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// ProductFilter scopes product list queries.
type ProductFilter struct {
	CategoryID *uuid.UUID
	BrandID    *uuid.UUID
	SellerID   *uuid.UUID
	MinPrice   *float64
	MaxPrice   *float64
	Status     *entity.ProductStatus
	Search     string // ILIKE match on product name
}
