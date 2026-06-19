//go:build integration

package persistence_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/persistence"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestProductRepository_Integration(t *testing.T) {
	ctx := context.Background()
	container, connStr := startPostgresContainer(t, ctx)
	t.Cleanup(func() {
		_ = container.Terminate(ctx)
	})

	runMigrations(t, connStr)
	pool := initPool(t, ctx, connStr)
	t.Cleanup(pool.Close)

	repo := persistence.NewProductPostgresRepo(pool, nil)
	variantRepo := persistence.NewProductVariantPostgresRepo(pool, nil)
	imageRepo := persistence.NewProductImagePostgresRepo(pool, nil)

	categoryID := insertTestCategory(t, ctx, pool)
	sellerID := uuid.New()
	brandID := insertTestBrand(t, ctx, pool)

	t.Run("Create and FindByID", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, &brandID, "Wireless Headphones", entity.ProductStatusDraft)
		require.NoError(t, repo.Create(ctx, product))
		assert.NotEmpty(t, product.Slug)
		assert.Contains(t, product.Slug, product.ID.String()[:8])

		require.NoError(t, variantRepo.Create(ctx, &entity.ProductVariant{
			ProductID: product.ID,
			SKU:       "WH-001",
			Price:     99.99,
			Status:    entity.ProductStatusActive,
		}))
		require.NoError(t, imageRepo.Create(ctx, &entity.ProductImage{
			ProductID: product.ID,
			URL:       "https://cdn.example.com/wh-001.jpg",
			AltText:   "Wireless headphones",
			Position:  0,
		}))

		found, err := repo.FindByID(ctx, product.ID)
		require.NoError(t, err)
		assert.Equal(t, product.ID, found.ID)
		assert.Equal(t, product.Name, found.Name)
		assert.Equal(t, product.Slug, found.Slug)
		require.Len(t, found.Variants, 1)
		assert.Equal(t, "WH-001", found.Variants[0].SKU)
		require.Len(t, found.Images, 1)
		assert.Equal(t, "https://cdn.example.com/wh-001.jpg", found.Images[0].URL)
	})

	t.Run("Update and FindBySlug", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, nil, "Gaming Mouse", entity.ProductStatusDraft)
		require.NoError(t, repo.Create(ctx, product))

		product.Name = "Pro Gaming Mouse"
		product.Description = "High DPI gaming mouse"
		product.Status = entity.ProductStatusInactive
		require.NoError(t, repo.Update(ctx, product))

		found, err := repo.FindBySlug(ctx, product.Slug)
		require.NoError(t, err)
		assert.Equal(t, "Pro Gaming Mouse", found.Name)
		assert.Equal(t, "High DPI gaming mouse", found.Description)
		assert.Equal(t, entity.ProductStatusInactive, found.Status)
	})

	t.Run("Archive then FindByID returns not found", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, nil, "Archived Item", entity.ProductStatusInactive)
		require.NoError(t, repo.Create(ctx, product))

		require.NoError(t, repo.Archive(ctx, product.ID))

		_, err := repo.FindByID(ctx, product.ID)
		require.Error(t, err)
		appErr, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.Equal(t, "PRODUCT_NOT_FOUND", appErr.Code)
	})

	t.Run("List with filters", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, &brandID, "Filterable Keyboard", entity.ProductStatusActive)
		require.NoError(t, repo.Create(ctx, product))
		require.NoError(t, variantRepo.Create(ctx, &entity.ProductVariant{
			ProductID: product.ID,
			SKU:       "KB-FILTER-001",
			Price:     150.00,
			Status:    entity.ProductStatusActive,
		}))

		status := entity.ProductStatusActive
		products, total, err := repo.List(ctx, repository.ProductFilter{
			SellerID:   &sellerID,
			CategoryID: &categoryID,
			BrandID:    &brandID,
			Status:     &status,
			Search:     "Keyboard",
			MinPrice:   ptrFloat64(100),
			MaxPrice:   ptrFloat64(200),
		}, pagination.CursorParams{Limit: 10})
		require.NoError(t, err)
		assert.GreaterOrEqual(t, total, int64(1))
		require.NotEmpty(t, products)

		found := false
		for _, p := range products {
			if p.ID == product.ID {
				found = true
				break
			}
		}
		assert.True(t, found, "expected created product in filtered list")

		nextCursor := pagination.EncodeCursor(products[len(products)-1].ID.String(), products[len(products)-1].CreatedAt)
		_, _, err = repo.List(ctx, repository.ProductFilter{SellerID: &sellerID}, pagination.CursorParams{
			Cursor: nextCursor,
			Limit:  10,
		})
		require.NoError(t, err)
	})

	t.Run("Variant CRUD and duplicate SKU", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, nil, "Variant Product", entity.ProductStatusDraft)
		require.NoError(t, repo.Create(ctx, product))

		variant := &entity.ProductVariant{
			ProductID: product.ID,
			SKU:       "VAR-UNIQUE-001",
			Price:     49.99,
			Status:    entity.ProductStatusActive,
		}
		require.NoError(t, variantRepo.Create(ctx, variant))

		variant.Price = 59.99
		compare := 79.99
		weight := 0.5
		variant.ComparePrice = &compare
		variant.Weight = &weight
		require.NoError(t, variantRepo.Update(ctx, variant))

		found, err := variantRepo.FindByID(ctx, variant.ID)
		require.NoError(t, err)
		assert.Equal(t, 59.99, found.Price)
		require.NotNil(t, found.ComparePrice)
		assert.Equal(t, 79.99, *found.ComparePrice)

		byProduct, err := variantRepo.FindByProductID(ctx, product.ID)
		require.NoError(t, err)
		require.Len(t, byProduct, 1)

		dup := &entity.ProductVariant{
			ProductID: product.ID,
			SKU:       "VAR-UNIQUE-001",
			Price:     10,
			Status:    entity.ProductStatusActive,
		}
		err = variantRepo.Create(ctx, dup)
		require.Error(t, err)
		dupErr, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.Equal(t, "DUPLICATE_SKU", dupErr.Code)

		require.NoError(t, variantRepo.Delete(ctx, variant.ID))
		_, err = variantRepo.FindByID(ctx, variant.ID)
		require.Error(t, err)
	})

	t.Run("Image repository operations", func(t *testing.T) {
		product := newTestProduct(categoryID, sellerID, nil, "Image Product", entity.ProductStatusDraft)
		require.NoError(t, repo.Create(ctx, product))

		image := &entity.ProductImage{
			ProductID: product.ID,
			URL:       "https://cdn.example.com/img-1.jpg",
			AltText:   "Front view",
			Position:  1,
		}
		require.NoError(t, imageRepo.Create(ctx, image))

		count, err := imageRepo.CountByProductID(ctx, product.ID)
		require.NoError(t, err)
		assert.Equal(t, 1, count)

		images, err := imageRepo.FindByProductID(ctx, product.ID)
		require.NoError(t, err)
		require.Len(t, images, 1)
		assert.Equal(t, 1, images[0].Position)

		err = imageRepo.Create(ctx, &entity.ProductImage{
			ProductID: product.ID,
			URL:       "https://cdn.example.com/img-bad.jpg",
			Position:  -1,
		})
		require.Error(t, err)

		require.NoError(t, imageRepo.Delete(ctx, image.ID))
		count, err = imageRepo.CountByProductID(ctx, product.ID)
		require.NoError(t, err)
		assert.Equal(t, 0, count)

		err = imageRepo.Delete(ctx, image.ID)
		require.Error(t, err)
	})

	t.Run("Archive missing product returns not found", func(t *testing.T) {
		err := repo.Archive(ctx, uuid.New())
		require.Error(t, err)
		notFound, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.Equal(t, "PRODUCT_NOT_FOUND", notFound.Code)
	})
}

func newTestProduct(categoryID, sellerID uuid.UUID, brandID *uuid.UUID, name string, status entity.ProductStatus) *entity.Product {
	return &entity.Product{
		ID:          uuid.New(),
		SellerID:    sellerID,
		CategoryID:  categoryID,
		BrandID:     brandID,
		Name:        name,
		Description: "Test product",
		Status:      status,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
}

func insertTestCategory(t *testing.T, ctx context.Context, pool *pgxpool.Pool) uuid.UUID {
	t.Helper()

	id := uuid.New()
	_, err := pool.Exec(ctx, `
		INSERT INTO categories (id, name, slug, is_active)
		VALUES ($1, $2, $3, true)`,
		id, "Test Category "+id.String()[:8], "test-category-"+id.String()[:8],
	)
	require.NoError(t, err)
	return id
}

func insertTestBrand(t *testing.T, ctx context.Context, pool *pgxpool.Pool) uuid.UUID {
	t.Helper()

	id := uuid.New()
	_, err := pool.Exec(ctx, `
		INSERT INTO brands (id, name, slug, is_active)
		VALUES ($1, $2, $3, true)`,
		id, "Test Brand "+id.String()[:8], "test-brand-"+id.String()[:8],
	)
	require.NoError(t, err)
	return id
}

func ptrFloat64(v float64) *float64 {
	return &v
}
