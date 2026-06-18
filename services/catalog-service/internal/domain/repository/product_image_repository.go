package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

// ProductImageRepository persists and retrieves product images.
type ProductImageRepository interface {
	Create(ctx context.Context, image *entity.ProductImage) error
	Delete(ctx context.Context, imageID uuid.UUID) error
	FindByProductID(ctx context.Context, productID uuid.UUID) ([]*entity.ProductImage, error)
	CountByProductID(ctx context.Context, productID uuid.UUID) (int, error)
}
