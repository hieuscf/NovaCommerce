package application

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

// ProductUseCase defines product management operations.
type ProductUseCase interface {
	CreateProduct(ctx context.Context, sellerID uuid.UUID, input CreateProductInput) (*ProductOutput, error)
	GetProductByID(ctx context.Context, id uuid.UUID) (*ProductOutput, error)
	GetProductBySlug(ctx context.Context, slug string) (*ProductOutput, error)
	UpdateProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID, input UpdateProductInput) (*ProductOutput, error)
	ArchiveProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID) error

	ListProducts(ctx context.Context, filter repository.ProductFilter, page pagination.CursorParams) (*ProductListOutput, error)

	AddProductImage(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input AddImageInput) (*ImageOutput, error)
	RemoveProductImage(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, imageID uuid.UUID) error

	AddVariant(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input AddVariantInput) (*VariantOutput, error)
	UpdateVariant(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, variantID uuid.UUID, input UpdateVariantInput) (*VariantOutput, error)
	RemoveVariant(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, variantID uuid.UUID) error
}
