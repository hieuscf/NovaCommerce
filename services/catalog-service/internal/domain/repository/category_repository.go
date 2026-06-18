package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// CategoryRepository persists and retrieves categories.
type CategoryRepository interface {
	Create(ctx context.Context, category *entity.Category) error
	Update(ctx context.Context, category *entity.Category) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Category, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Category, error)
	List(ctx context.Context, activeOnly bool) ([]*entity.Category, error)
	GetDescendantIDs(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error)
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
}
