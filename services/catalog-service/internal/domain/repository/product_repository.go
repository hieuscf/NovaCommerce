package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// ProductFilter scopes product list queries.
type ProductFilter struct {
	CategoryIDs []uuid.UUID
	BrandID     *uuid.UUID
	SellerID    *uuid.UUID
	MinPrice    *float64
	MaxPrice    *float64
	Status      *entity.ProductStatus
	Search      string
}

// ProductRepository persists and retrieves products.
type ProductRepository interface {
	Create(ctx context.Context, product *entity.Product) error
	Update(ctx context.Context, product *entity.Product) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Product, error)
	FindBySellerID(ctx context.Context, sellerID uuid.UUID, filter ProductFilter, page pagination.CursorParams) ([]*entity.Product, int64, error)
	List(ctx context.Context, filter ProductFilter, page pagination.CursorParams) ([]*entity.Product, int64, error)
	ListByCategoryIDs(ctx context.Context, categoryIDs []uuid.UUID, page pagination.CursorParams) ([]*entity.Product, int64, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status entity.ProductStatus) error
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}
