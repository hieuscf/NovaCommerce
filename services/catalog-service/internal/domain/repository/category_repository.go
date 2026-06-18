package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// CategoryRepository manages category persistence.
type CategoryRepository interface {
	Create(ctx context.Context, category *entity.Category) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Category, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Category, error)
	List(ctx context.Context, parentID *uuid.UUID, activeOnly bool) ([]*entity.Category, error)
	Update(ctx context.Context, category *entity.Category) error
}
