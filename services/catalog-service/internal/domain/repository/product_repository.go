package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// ProductRepository persists and retrieves products.
type ProductRepository interface {
	Create(ctx context.Context, product *entity.Product) error
	Update(ctx context.Context, product *entity.Product) error
	Archive(ctx context.Context, id uuid.UUID) error

	FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Product, error)
	List(ctx context.Context, filter ProductFilter, page pagination.CursorParams) ([]*entity.Product, int64, error)
}
