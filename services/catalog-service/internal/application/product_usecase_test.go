package application_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/kafka"
	"github.com/novacommerce/pkg/pagination"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type noopTransactor struct{}

func (noopTransactor) WithTransaction(ctx context.Context, fn func(context.Context) error) error {
	return fn(ctx)
}

type mockProductRepository struct {
	createFn     func(ctx context.Context, product *entity.Product) error
	updateFn     func(ctx context.Context, product *entity.Product) error
	archiveFn    func(ctx context.Context, id uuid.UUID) error
	findByIDFn   func(ctx context.Context, id uuid.UUID) (*entity.Product, error)
	findBySlugFn func(ctx context.Context, slug string) (*entity.Product, error)

	createCalls   int
	findByIDCalls int
	updateCalls   int
}

func (m *mockProductRepository) Create(ctx context.Context, product *entity.Product) error {
	m.createCalls++
	if m.createFn != nil {
		return m.createFn(ctx, product)
	}
	return nil
}

func (m *mockProductRepository) Update(ctx context.Context, product *entity.Product) error {
	m.updateCalls++
	if m.updateFn != nil {
		return m.updateFn(ctx, product)
	}
	return nil
}

func (m *mockProductRepository) Archive(ctx context.Context, id uuid.UUID) error {
	if m.archiveFn != nil {
		return m.archiveFn(ctx, id)
	}
	return nil
}

func (m *mockProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error) {
	m.findByIDCalls++
	if m.findByIDFn != nil {
		return m.findByIDFn(ctx, id)
	}
	return nil, entity.ErrProductNotFound
}

func (m *mockProductRepository) FindBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	if m.findBySlugFn != nil {
		return m.findBySlugFn(ctx, slug)
	}
	return nil, entity.ErrProductNotFound
}

func (m *mockProductRepository) List(context.Context, repository.ProductFilter, pagination.CursorParams) ([]*entity.Product, int64, error) {
	return nil, 0, nil
}

type mockVariantRepository struct {
	createFn   func(ctx context.Context, variant *entity.ProductVariant) error
	updateFn   func(ctx context.Context, variant *entity.ProductVariant) error
	deleteFn   func(ctx context.Context, variantID uuid.UUID) error
	findByIDFn func(ctx context.Context, id uuid.UUID) (*entity.ProductVariant, error)

	createCalls int
}

func (m *mockVariantRepository) Create(ctx context.Context, variant *entity.ProductVariant) error {
	m.createCalls++
	if m.createFn != nil {
		return m.createFn(ctx, variant)
	}
	return nil
}

func (m *mockVariantRepository) Update(ctx context.Context, variant *entity.ProductVariant) error {
	if m.updateFn != nil {
		return m.updateFn(ctx, variant)
	}
	return nil
}

func (m *mockVariantRepository) Delete(ctx context.Context, variantID uuid.UUID) error {
	if m.deleteFn != nil {
		return m.deleteFn(ctx, variantID)
	}
	return nil
}

func (m *mockVariantRepository) FindByProductID(context.Context, uuid.UUID) ([]*entity.ProductVariant, error) {
	return nil, nil
}

func (m *mockVariantRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.ProductVariant, error) {
	if m.findByIDFn != nil {
		return m.findByIDFn(ctx, id)
	}
	return nil, entity.ErrVariantNotFound
}

type mockImageRepository struct {
	createFn   func(ctx context.Context, image *entity.ProductImage) error
	deleteFn   func(ctx context.Context, imageID uuid.UUID) error
	countFn    func(ctx context.Context, productID uuid.UUID) (int, error)
	createCalls int
}

func (m *mockImageRepository) Create(ctx context.Context, image *entity.ProductImage) error {
	m.createCalls++
	if m.createFn != nil {
		return m.createFn(ctx, image)
	}
	return nil
}

func (m *mockImageRepository) Delete(ctx context.Context, imageID uuid.UUID) error {
	if m.deleteFn != nil {
		return m.deleteFn(ctx, imageID)
	}
	return nil
}

func (m *mockImageRepository) FindByProductID(context.Context, uuid.UUID) ([]*entity.ProductImage, error) {
	return nil, nil
}

func (m *mockImageRepository) CountByProductID(ctx context.Context, productID uuid.UUID) (int, error) {
	if m.countFn != nil {
		return m.countFn(ctx, productID)
	}
	return 0, nil
}

type mockVariantAttrRepository struct {
	createCalls int
}

func (m *mockVariantAttrRepository) Create(context.Context, *entity.VariantAttributeValue) error {
	m.createCalls++
	return nil
}

type mockOutboxWriter struct {
	writeCalls int
	lastTopic  string
}

func (m *mockOutboxWriter) Write(_ context.Context, msg kafka.OutboxMessage) error {
	m.writeCalls++
	m.lastTopic = msg.Topic
	return nil
}

type mockFileServiceClient struct {
	validateFn func(ctx context.Context, fileKey string) error
	buildURLFn func(fileKey string) string
}

func (m *mockFileServiceClient) ValidateFileExists(ctx context.Context, fileKey string) error {
	if m.validateFn != nil {
		return m.validateFn(ctx, fileKey)
	}
	return nil
}

func (m *mockFileServiceClient) BuildURL(fileKey string) string {
	if m.buildURLFn != nil {
		return m.buildURLFn(fileKey)
	}
	return "https://files.example.com/files/" + fileKey
}

func newTestProductUseCase(
	productRepo repository.ProductRepository,
	variantRepo repository.ProductVariantRepository,
	imageRepo repository.ProductImageRepository,
	variantAttrRepo repository.VariantAttributeValueRepository,
	outbox kafka.OutboxWriter,
	files application.FileServiceClient,
) application.ProductUseCase {
	return application.NewProductUseCase(
		productRepo,
		variantRepo,
		imageRepo,
		variantAttrRepo,
		outbox,
		noopTransactor{},
		files,
	)
}

func TestProductUseCase_CreateProduct_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	categoryID := uuid.New()

	productRepo := &mockProductRepository{
		createFn: func(_ context.Context, product *entity.Product) error {
			product.Slug = "test-product"
			return nil
		},
	}
	variantRepo := &mockVariantRepository{}
	outbox := &mockOutboxWriter{}

	uc := newTestProductUseCase(productRepo, variantRepo, &mockImageRepository{}, &mockVariantAttrRepository{}, outbox, &mockFileServiceClient{})

	output, err := uc.CreateProduct(ctx, sellerID, application.CreateProductInput{
		Name:        "Test Product",
		Description: "Description",
		CategoryID:  categoryID,
		Variants: []application.CreateVariantInput{
			{SKU: "SKU-001", Price: 99.99},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, output)
	assert.Equal(t, "Test Product", output.Name)
	assert.Equal(t, sellerID, output.SellerID)
	assert.Len(t, output.Variants, 1)
	assert.Equal(t, 1, productRepo.createCalls)
	assert.Equal(t, 1, variantRepo.createCalls)
	assert.Equal(t, 1, outbox.writeCalls)
	assert.Equal(t, "product-events", outbox.lastTopic)
}

func TestProductUseCase_CreateProduct_ValidationNoVariants(t *testing.T) {
	ctx := context.Background()
	uc := newTestProductUseCase(
		&mockProductRepository{},
		&mockVariantRepository{},
		&mockImageRepository{},
		&mockVariantAttrRepository{},
		&mockOutboxWriter{},
		&mockFileServiceClient{},
	)

	_, err := uc.CreateProduct(ctx, uuid.New(), application.CreateProductInput{
		Name:       "No Variants",
		CategoryID: uuid.New(),
	})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestProductUseCase_CreateProduct_DuplicateSKU(t *testing.T) {
	ctx := context.Background()
	variantRepo := &mockVariantRepository{
		createFn: func(context.Context, *entity.ProductVariant) error {
			return entity.ErrDuplicateSKU
		},
	}
	uc := newTestProductUseCase(
		&mockProductRepository{},
		variantRepo,
		&mockImageRepository{},
		&mockVariantAttrRepository{},
		&mockOutboxWriter{},
		&mockFileServiceClient{},
	)

	_, err := uc.CreateProduct(ctx, uuid.New(), application.CreateProductInput{
		Name:       "Duplicate SKU Product",
		CategoryID: uuid.New(),
		Variants: []application.CreateVariantInput{
			{SKU: "DUP-001", Price: 10},
		},
	})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "DUPLICATE_SKU", appErr.Code)
}

func TestProductUseCase_UpdateProduct_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()
	updatedName := "Updated Name"

	productRepo := &mockProductRepository{
		findByIDFn: func(_ context.Context, id uuid.UUID) (*entity.Product, error) {
			return &entity.Product{
				ID:       productID,
				SellerID: sellerID,
				Name:     updatedName,
				Slug:     "original",
				Status:   entity.ProductStatusDraft,
			}, nil
		},
	}
	outbox := &mockOutboxWriter{}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, &mockImageRepository{}, &mockVariantAttrRepository{}, outbox, &mockFileServiceClient{})

	output, err := uc.UpdateProduct(ctx, sellerID, productID, application.UpdateProductInput{
		Name: &updatedName,
	})
	require.NoError(t, err)
	assert.Equal(t, "Updated Name", output.Name)
	assert.Equal(t, 1, productRepo.updateCalls)
	assert.Equal(t, 1, outbox.writeCalls)
}

func TestProductUseCase_UpdateProduct_NotFound(t *testing.T) {
	ctx := context.Background()
	uc := newTestProductUseCase(
		&mockProductRepository{},
		&mockVariantRepository{},
		&mockImageRepository{},
		&mockVariantAttrRepository{},
		&mockOutboxWriter{},
		&mockFileServiceClient{},
	)

	name := "Updated"
	_, err := uc.UpdateProduct(ctx, uuid.New(), uuid.New(), application.UpdateProductInput{Name: &name})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "PRODUCT_NOT_FOUND", appErr.Code)
}

func TestProductUseCase_UpdateProduct_Forbidden(t *testing.T) {
	ctx := context.Background()
	ownerID := uuid.New()
	otherSeller := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: ownerID, Status: entity.ProductStatusDraft}, nil
		},
	}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, &mockImageRepository{}, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	name := "Hack"
	_, err := uc.UpdateProduct(ctx, otherSeller, productID, application.UpdateProductInput{Name: &name})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "PRODUCT_FORBIDDEN", appErr.Code)
}

func TestProductUseCase_ArchiveProduct_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{
				ID:       productID,
				SellerID: sellerID,
				Slug:     "archivable",
				Status:   entity.ProductStatusInactive,
			}, nil
		},
	}
	outbox := &mockOutboxWriter{}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, &mockImageRepository{}, &mockVariantAttrRepository{}, outbox, &mockFileServiceClient{})

	require.NoError(t, uc.ArchiveProduct(ctx, sellerID, productID))
	assert.Equal(t, 1, outbox.writeCalls)
}

func TestProductUseCase_ArchiveProduct_Forbidden(t *testing.T) {
	ctx := context.Background()
	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: uuid.New(), SellerID: uuid.New(), Status: entity.ProductStatusDraft}, nil
		},
	}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, &mockImageRepository{}, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	err := uc.ArchiveProduct(ctx, uuid.New(), uuid.New())
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "PRODUCT_FORBIDDEN", appErr.Code)
}

func TestProductUseCase_AddProductImage_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID, Status: entity.ProductStatusActive}, nil
		},
	}
	imageRepo := &mockImageRepository{
		countFn: func(context.Context, uuid.UUID) (int, error) { return 2, nil },
	}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, imageRepo, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	output, err := uc.AddProductImage(ctx, sellerID, productID, application.AddImageInput{
		FileKey:  "product/image-1.jpg",
		AltText:  "Front",
		Position: 0,
	})
	require.NoError(t, err)
	assert.Equal(t, "https://files.example.com/files/product/image-1.jpg", output.URL)
	assert.Equal(t, 1, imageRepo.createCalls)
}

func TestProductUseCase_AddProductImage_MaxImagesExceeded(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID}, nil
		},
	}
	imageRepo := &mockImageRepository{
		countFn: func(context.Context, uuid.UUID) (int, error) { return 10, nil },
	}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, imageRepo, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	_, err := uc.AddProductImage(ctx, sellerID, productID, application.AddImageInput{FileKey: "x.jpg"})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "MAX_IMAGES_EXCEEDED", appErr.Code)
}

func TestProductUseCase_AddProductImage_Forbidden(t *testing.T) {
	ctx := context.Background()
	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: uuid.New(), SellerID: uuid.New()}, nil
		},
	}
	uc := newTestProductUseCase(productRepo, &mockVariantRepository{}, &mockImageRepository{}, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	_, err := uc.AddProductImage(ctx, uuid.New(), uuid.New(), application.AddImageInput{FileKey: "x.jpg"})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "PRODUCT_FORBIDDEN", appErr.Code)
}

func TestProductUseCase_AddVariant_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID, Status: entity.ProductStatusActive}, nil
		},
	}
	variantRepo := &mockVariantRepository{}
	outbox := &mockOutboxWriter{}
	uc := newTestProductUseCase(productRepo, variantRepo, &mockImageRepository{}, &mockVariantAttrRepository{}, outbox, &mockFileServiceClient{})

	output, err := uc.AddVariant(ctx, sellerID, productID, application.AddVariantInput{
		SKU:   "NEW-SKU",
		Price: 49.99,
	})
	require.NoError(t, err)
	assert.Equal(t, "NEW-SKU", output.SKU)
	assert.Equal(t, 1, variantRepo.createCalls)
	assert.Equal(t, 1, outbox.writeCalls)
}

func TestProductUseCase_AddVariant_DuplicateSKU(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID}, nil
		},
	}
	variantRepo := &mockVariantRepository{
		createFn: func(context.Context, *entity.ProductVariant) error {
			return entity.ErrDuplicateSKU
		},
	}
	uc := newTestProductUseCase(productRepo, variantRepo, &mockImageRepository{}, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	_, err := uc.AddVariant(ctx, sellerID, productID, application.AddVariantInput{SKU: "DUP", Price: 10})
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "DUPLICATE_SKU", appErr.Code)
}

func TestProductUseCase_RemoveVariant_VariantNotInProduct(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()
	variantID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID}, nil
		},
	}
	variantRepo := &mockVariantRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.ProductVariant, error) {
			return &entity.ProductVariant{ID: variantID, ProductID: uuid.New()}, nil
		},
	}
	uc := newTestProductUseCase(productRepo, variantRepo, &mockImageRepository{}, &mockVariantAttrRepository{}, &mockOutboxWriter{}, &mockFileServiceClient{})

	err := uc.RemoveVariant(ctx, sellerID, productID, variantID)
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, "VARIANT_NOT_FOUND", appErr.Code)
}

func TestProductUseCase_RemoveVariant_Success(t *testing.T) {
	ctx := context.Background()
	sellerID := uuid.New()
	productID := uuid.New()
	variantID := uuid.New()

	productRepo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return &entity.Product{ID: productID, SellerID: sellerID}, nil
		},
	}
	variantRepo := &mockVariantRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.ProductVariant, error) {
			return &entity.ProductVariant{ID: variantID, ProductID: productID}, nil
		},
	}
	outbox := &mockOutboxWriter{}
	uc := newTestProductUseCase(productRepo, variantRepo, &mockImageRepository{}, &mockVariantAttrRepository{}, outbox, &mockFileServiceClient{})

	require.NoError(t, uc.RemoveVariant(ctx, sellerID, productID, variantID))
	assert.Equal(t, 1, outbox.writeCalls)
}
