package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain"
)

// BrandRepository persists and retrieves brands.
type BrandRepository interface {
	GetAll(ctx context.Context, onlyActive bool) ([]*domain.Brand, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Brand, error)
	Create(ctx context.Context, brand *domain.Brand) error
	Update(ctx context.Context, brand *domain.Brand) error
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}
