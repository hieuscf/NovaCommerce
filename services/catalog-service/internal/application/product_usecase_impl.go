package application

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/kafka"
	"github.com/novacommerce/pkg/pagination"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/services/catalog-service/internal/application/port"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

const (
	topicProductEvents    = "product-events"
	eventProductCreated   = "PRODUCT_CREATED"
	eventProductUpdated   = "PRODUCT_UPDATED"
	eventProductDeleted   = "PRODUCT_DELETED"
	maxProductImages      = 10
)

type productUseCase struct {
	productRepo     repository.ProductRepository
	variantRepo     repository.ProductVariantRepository
	imageRepo       repository.ProductImageRepository
	variantAttrRepo repository.VariantAttributeValueRepository
	outbox          kafka.OutboxWriter
	transactor      port.Transactor
	files           FileServiceClient
}

// NewProductUseCase creates a ProductUseCase with the given dependencies.
func NewProductUseCase(
	productRepo repository.ProductRepository,
	variantRepo repository.ProductVariantRepository,
	imageRepo repository.ProductImageRepository,
	variantAttrRepo repository.VariantAttributeValueRepository,
	outbox kafka.OutboxWriter,
	transactor port.Transactor,
	files FileServiceClient,
) ProductUseCase {
	return &productUseCase{
		productRepo:     productRepo,
		variantRepo:     variantRepo,
		imageRepo:       imageRepo,
		variantAttrRepo: variantAttrRepo,
		outbox:          outbox,
		transactor:      transactor,
		files:           files,
	}
}

type productEventPayload struct {
	EventID   uuid.UUID `json:"event_id"`
	Type      string    `json:"type"`
	ProductID uuid.UUID `json:"product_id"`
	SellerID  uuid.UUID `json:"seller_id,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

func (uc *productUseCase) CreateProduct(ctx context.Context, sellerID uuid.UUID, input CreateProductInput) (*ProductOutput, error) {
	if err := validateCreateProductInput(input); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	product := &entity.Product{
		ID:          uuid.New(),
		SellerID:    sellerID,
		CategoryID:  input.CategoryID,
		BrandID:     input.BrandID,
		Name:        strings.TrimSpace(input.Name),
		Description: input.Description,
		Status:      entity.ProductStatusDraft,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	variants := make([]*entity.ProductVariant, 0, len(input.Variants))

	err := uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.productRepo.Create(txCtx, product); err != nil {
			return err
		}

		for _, variantInput := range input.Variants {
			variant := &entity.ProductVariant{
				ID:           uuid.New(),
				ProductID:    product.ID,
				SKU:          strings.TrimSpace(variantInput.SKU),
				Price:        variantInput.Price,
				ComparePrice: variantInput.ComparePrice,
				Weight:       variantInput.Weight,
				Status:       entity.ProductStatusActive,
				CreatedAt:    now,
				UpdatedAt:    now,
			}
			if err := uc.variantRepo.Create(txCtx, variant); err != nil {
				return err
			}
			if err := uc.assignVariantAttributes(txCtx, variant.ID, variantInput.Attributes); err != nil {
				return err
			}
			variants = append(variants, variant)
		}

		return uc.writeProductEvent(txCtx, eventProductCreated, product)
	})
	if err != nil {
		return nil, wrapProductUseCaseError("CreateProduct", err)
	}

	product.Variants = variants
	output := mapProductToOutput(product)
	return &output, nil
}

func (uc *productUseCase) GetProductByID(ctx context.Context, id uuid.UUID) (*ProductOutput, error) {
	product, err := uc.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, wrapProductUseCaseError("GetProductByID", err)
	}
	output := mapProductToOutput(product)
	return &output, nil
}

func (uc *productUseCase) GetProductBySlug(ctx context.Context, slug string) (*ProductOutput, error) {
	product, err := uc.productRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, wrapProductUseCaseError("GetProductBySlug", err)
	}
	output := mapProductToOutput(product)
	return &output, nil
}

func (uc *productUseCase) UpdateProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID, input UpdateProductInput) (*ProductOutput, error) {
	product, err := uc.getOwnedProduct(ctx, sellerID, id)
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateProduct", err)
	}

	applyProductUpdate(product, input)

	err = uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.productRepo.Update(txCtx, product); err != nil {
			return err
		}
		return uc.writeProductEvent(txCtx, eventProductUpdated, product)
	})
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateProduct", err)
	}

	updated, err := uc.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateProduct", err)
	}
	output := mapProductToOutput(updated)
	return &output, nil
}

func (uc *productUseCase) ArchiveProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID) error {
	product, err := uc.getOwnedProduct(ctx, sellerID, id)
	if err != nil {
		return wrapProductUseCaseError("ArchiveProduct", err)
	}
	if !product.CanBeArchived() {
		return entity.ErrProductNotArchivable
	}

	return uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.productRepo.Archive(txCtx, id); err != nil {
			return err
		}
		return uc.writeProductEvent(txCtx, eventProductDeleted, product)
	})
}

func (uc *productUseCase) ListProducts(
	ctx context.Context,
	filter repository.ProductFilter,
	page pagination.CursorParams,
) (*ProductListOutput, error) {
	products, total, err := uc.productRepo.List(ctx, filter, page)
	if err != nil {
		return nil, wrapProductUseCaseError("ListProducts", err)
	}

	items := make([]ProductOutput, 0, len(products))
	for _, product := range products {
		items = append(items, mapProductToOutput(product))
	}

	var lastID string
	var lastCreatedAt time.Time
	if len(products) > 0 {
		last := products[len(products)-1]
		lastID = last.ID.String()
		lastCreatedAt = last.CreatedAt
	}

	pageResult := pagination.BuildResult(items, lastID, lastCreatedAt, total, &page)

	return &ProductListOutput{
		Items:      items,
		Total:      total,
		NextCursor: pageResult.NextCursor,
	}, nil
}

func (uc *productUseCase) AddProductImage(
	ctx context.Context,
	sellerID uuid.UUID,
	productID uuid.UUID,
	input AddImageInput,
) (*ImageOutput, error) {
	if _, err := uc.getOwnedProduct(ctx, sellerID, productID); err != nil {
		return nil, wrapProductUseCaseError("AddProductImage", err)
	}

	count, err := uc.imageRepo.CountByProductID(ctx, productID)
	if err != nil {
		return nil, wrapProductUseCaseError("AddProductImage", err)
	}
	if count >= maxProductImages {
		return nil, entity.ErrMaxImagesExceeded
	}

	if err := uc.files.ValidateFileExists(ctx, input.FileKey); err != nil {
		return nil, wrapProductUseCaseError("AddProductImage", err)
	}

	image := &entity.ProductImage{
		ID:        uuid.New(),
		ProductID: productID,
		URL:       uc.files.BuildURL(input.FileKey),
		AltText:   input.AltText,
		Position:  input.Position,
		CreatedAt: time.Now().UTC(),
	}
	if err := uc.imageRepo.Create(ctx, image); err != nil {
		return nil, wrapProductUseCaseError("AddProductImage", err)
	}

	output := mapImageToOutput(image)
	return &output, nil
}

func (uc *productUseCase) RemoveProductImage(ctx context.Context, sellerID, productID, imageID uuid.UUID) error {
	if _, err := uc.getOwnedProduct(ctx, sellerID, productID); err != nil {
		return wrapProductUseCaseError("RemoveProductImage", err)
	}
	if err := uc.imageRepo.Delete(ctx, imageID); err != nil {
		return wrapProductUseCaseError("RemoveProductImage", err)
	}
	return nil
}

func (uc *productUseCase) AddVariant(
	ctx context.Context,
	sellerID uuid.UUID,
	productID uuid.UUID,
	input AddVariantInput,
) (*VariantOutput, error) {
	product, err := uc.getOwnedProduct(ctx, sellerID, productID)
	if err != nil {
		return nil, wrapProductUseCaseError("AddVariant", err)
	}
	if err := validateVariantPricing(input.SKU, input.Price); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	variant := &entity.ProductVariant{
		ID:           uuid.New(),
		ProductID:    product.ID,
		SKU:          strings.TrimSpace(input.SKU),
		Price:        input.Price,
		ComparePrice: input.ComparePrice,
		Weight:       input.Weight,
		Status:       entity.ProductStatusActive,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	err = uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.variantRepo.Create(txCtx, variant); err != nil {
			return err
		}
		if err := uc.assignVariantAttributes(txCtx, variant.ID, input.Attributes); err != nil {
			return err
		}
		return uc.writeProductEvent(txCtx, eventProductUpdated, product)
	})
	if err != nil {
		return nil, wrapProductUseCaseError("AddVariant", err)
	}

	output := mapVariantToOutput(variant)
	return &output, nil
}

func (uc *productUseCase) UpdateVariant(
	ctx context.Context,
	sellerID uuid.UUID,
	productID uuid.UUID,
	variantID uuid.UUID,
	input UpdateVariantInput,
) (*VariantOutput, error) {
	product, err := uc.getOwnedProduct(ctx, sellerID, productID)
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateVariant", err)
	}

	variant, err := uc.getProductVariant(ctx, productID, variantID)
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateVariant", err)
	}

	applyVariantUpdate(variant, input)

	err = uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.variantRepo.Update(txCtx, variant); err != nil {
			return err
		}
		return uc.writeProductEvent(txCtx, eventProductUpdated, product)
	})
	if err != nil {
		return nil, wrapProductUseCaseError("UpdateVariant", err)
	}

	output := mapVariantToOutput(variant)
	return &output, nil
}

func (uc *productUseCase) RemoveVariant(ctx context.Context, sellerID, productID, variantID uuid.UUID) error {
	product, err := uc.getOwnedProduct(ctx, sellerID, productID)
	if err != nil {
		return wrapProductUseCaseError("RemoveVariant", err)
	}
	if _, err := uc.getProductVariant(ctx, productID, variantID); err != nil {
		return wrapProductUseCaseError("RemoveVariant", err)
	}

	return uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.variantRepo.Delete(txCtx, variantID); err != nil {
			return err
		}
		return uc.writeProductEvent(txCtx, eventProductUpdated, product)
	})
}

func (uc *productUseCase) getOwnedProduct(ctx context.Context, sellerID, productID uuid.UUID) (*entity.Product, error) {
	product, err := uc.productRepo.FindByID(ctx, productID)
	if err != nil {
		return nil, err
	}
	if !product.IsOwnedBy(sellerID) {
		return nil, entity.ErrProductForbidden
	}
	return product, nil
}

func (uc *productUseCase) getProductVariant(ctx context.Context, productID, variantID uuid.UUID) (*entity.ProductVariant, error) {
	variant, err := uc.variantRepo.FindByID(ctx, variantID)
	if err != nil {
		return nil, err
	}
	if variant.ProductID != productID {
		return nil, entity.ErrVariantNotFound
	}
	return variant, nil
}

func (uc *productUseCase) assignVariantAttributes(ctx context.Context, variantID uuid.UUID, attributes map[uuid.UUID]uuid.UUID) error {
	for _, valueID := range attributes {
		link := &entity.VariantAttributeValue{
			ID:               uuid.New(),
			VariantID:        variantID,
			AttributeValueID: valueID,
		}
		if err := uc.variantAttrRepo.Create(ctx, link); err != nil {
			return err
		}
	}
	return nil
}

func (uc *productUseCase) writeProductEvent(ctx context.Context, eventType string, product *entity.Product) error {
	eventID := uuid.New()
	payload, err := json.Marshal(productEventPayload{
		EventID:   eventID,
		Type:      eventType,
		ProductID: product.ID,
		SellerID:  product.SellerID,
		Timestamp: time.Now().UTC(),
	})
	if err != nil {
		return fmt.Errorf("marshal product event: %w", err)
	}

	return uc.outbox.Write(ctx, kafka.OutboxMessage{
		ID:        eventID,
		Topic:     topicProductEvents,
		Key:       product.ID.String(),
		Payload:   payload,
		CreatedAt: time.Now().UTC(),
	})
}

func validateCreateProductInput(input CreateProductInput) error {
	if strings.TrimSpace(input.Name) == "" {
		return apperrors.NewValidation("name is required", nil)
	}
	if len(input.Variants) == 0 {
		return apperrors.NewValidation("at least one variant is required", nil)
	}
	for _, variant := range input.Variants {
		if err := validateVariantPricing(variant.SKU, variant.Price); err != nil {
			return err
		}
	}
	return nil
}

func validateVariantPricing(sku string, price float64) error {
	if strings.TrimSpace(sku) == "" {
		return apperrors.NewValidation("variant SKU is required", nil)
	}
	if price <= 0 {
		return apperrors.NewValidation("variant price must be greater than 0", nil)
	}
	return nil
}

func applyProductUpdate(product *entity.Product, input UpdateProductInput) {
	if input.Name != nil {
		product.Name = strings.TrimSpace(*input.Name)
	}
	if input.Description != nil {
		product.Description = *input.Description
	}
	if input.CategoryID != nil {
		product.CategoryID = *input.CategoryID
	}
	if input.BrandID != nil {
		product.BrandID = input.BrandID
	}
	if input.Status != nil {
		product.Status = *input.Status
	}
}

func applyVariantUpdate(variant *entity.ProductVariant, input UpdateVariantInput) {
	if input.Price != nil {
		variant.Price = *input.Price
	}
	if input.ComparePrice != nil {
		variant.ComparePrice = input.ComparePrice
	}
	if input.Weight != nil {
		variant.Weight = input.Weight
	}
	if input.Status != nil {
		variant.Status = *input.Status
	}
}

func mapProductToOutput(product *entity.Product) ProductOutput {
	output := ProductOutput{
		ID:          product.ID,
		SellerID:    product.SellerID,
		CategoryID:  product.CategoryID,
		BrandID:     product.BrandID,
		Name:        product.Name,
		Slug:        product.Slug,
		Description: product.Description,
		Status:      string(product.Status),
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
		Variants:    make([]VariantOutput, 0, len(product.Variants)),
		Images:      make([]ImageOutput, 0, len(product.Images)),
	}
	for _, variant := range product.Variants {
		output.Variants = append(output.Variants, mapVariantToOutput(variant))
	}
	for _, image := range product.Images {
		output.Images = append(output.Images, mapImageToOutput(image))
	}
	return output
}

func mapVariantToOutput(variant *entity.ProductVariant) VariantOutput {
	output := VariantOutput{
		ID:           variant.ID,
		SKU:          variant.SKU,
		Price:        variant.Price,
		ComparePrice: variant.ComparePrice,
		Weight:       variant.Weight,
		Status:       string(variant.Status),
		Attributes:   make([]AttributeOutput, 0, len(variant.Attributes)),
	}
	for _, attr := range variant.Attributes {
		output.Attributes = append(output.Attributes, AttributeOutput{
			Name:  attr.AttributeName,
			Value: attr.Value,
		})
	}
	return output
}

func mapImageToOutput(image *entity.ProductImage) ImageOutput {
	return ImageOutput{
		ID:       image.ID,
		URL:      image.URL,
		AltText:  image.AltText,
		Position: image.Position,
	}
}

func wrapProductUseCaseError(method string, err error) error {
	if _, ok := apperrors.IsAppError(err); ok {
		return err
	}
	if err == entity.ErrProductNotFound ||
		err == entity.ErrProductForbidden ||
		err == entity.ErrVariantNotFound ||
		err == entity.ErrDuplicateSKU ||
		err == entity.ErrMaxImagesExceeded ||
		err == entity.ErrProductNotArchivable {
		return err
	}
	return fmt.Errorf("productUseCase.%s: %w", method, err)
}
