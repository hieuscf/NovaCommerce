package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// BrandRepository persists and retrieves brands.
type BrandRepository interface {
	Create(ctx context.Context, brand *entity.Brand) error
	Update(ctx context.Context, brand *entity.Brand) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Brand, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Brand, error)
	List(ctx context.Context, activeOnly bool) ([]*entity.Brand, error)
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}
