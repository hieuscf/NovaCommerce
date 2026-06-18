package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// ProductVariantRepository persists and retrieves product variants.
type ProductVariantRepository interface {
	Create(ctx context.Context, variant *entity.ProductVariant) error
	Update(ctx context.Context, variant *entity.ProductVariant) error
	Delete(ctx context.Context, variantID uuid.UUID) error

	FindByProductID(ctx context.Context, productID uuid.UUID) ([]*entity.ProductVariant, error)
	FindByID(ctx context.Context, id uuid.UUID) (*entity.ProductVariant, error)
}
