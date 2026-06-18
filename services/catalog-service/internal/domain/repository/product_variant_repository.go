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
	FindByID(ctx context.Context, id uuid.UUID) (*entity.ProductVariant, error)
	FindBySKU(ctx context.Context, sku string) (*entity.ProductVariant, error)
	FindByProductID(ctx context.Context, productID uuid.UUID) ([]*entity.ProductVariant, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status entity.ProductVariantStatus) error
	ExistsBySKU(ctx context.Context, sku string) (bool, error)
}
