package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain"
)

// CategoryRepository persists and retrieves categories.
type CategoryRepository interface {
	GetAll(ctx context.Context) ([]*domain.Category, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error)
	GetDescendantIDs(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error)
	Create(ctx context.Context, category *domain.Category) error
	Update(ctx context.Context, category *domain.Category) error
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}
