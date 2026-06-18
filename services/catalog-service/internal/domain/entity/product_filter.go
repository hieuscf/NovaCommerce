package entity

import (
	"github.com/google/uuid"
	"github.com/novacommerce/pkg/pagination"
)

// ProductFilter holds list-query filter parameters.
type ProductFilter struct {
	CategoryID *uuid.UUID
	BrandID    *uuid.UUID
	SellerID   *uuid.UUID
	MinPrice   *float64
	MaxPrice   *float64
	Status     *ProductStatus
	Search     string
}

// Pagination is cursor-based pagination (cursor encodes base64 JSON of last_created_at + last_id).
type Pagination = pagination.CursorParams
