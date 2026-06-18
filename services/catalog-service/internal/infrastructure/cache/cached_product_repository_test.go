package cache_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/cache"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockProductRepository struct {
	findByIDFn   func(ctx context.Context, id uuid.UUID) (*entity.Product, error)
	findBySlugFn func(ctx context.Context, slug string) (*entity.Product, error)
	updateFn     func(ctx context.Context, product *entity.Product) error
	archiveFn    func(ctx context.Context, id uuid.UUID) error

	findByIDCalls   int
	findBySlugCalls int
	updateCalls     int
}

func (m *mockProductRepository) Create(context.Context, *entity.Product) error { return nil }
func (m *mockProductRepository) List(context.Context, repository.ProductFilter, pagination.CursorParams) ([]*entity.Product, int64, error) {
	return nil, 0, nil
}

func (m *mockProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error) {
	m.findByIDCalls++
	if m.findByIDFn != nil {
		return m.findByIDFn(ctx, id)
	}
	return nil, entity.ErrProductNotFound
}

func (m *mockProductRepository) FindBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	m.findBySlugCalls++
	if m.findBySlugFn != nil {
		return m.findBySlugFn(ctx, slug)
	}
	return nil, entity.ErrProductNotFound
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

type mockProductCache struct {
	byID   map[uuid.UUID]*entity.Product
	bySlug map[string]*entity.Product

	getByIDErr   error
	getBySlugErr error
	setErr       error
	invalidateFn func(ctx context.Context, id uuid.UUID, slug string) error

	setCalls        int
	invalidateCalls int
}

func newMockProductCache() *mockProductCache {
	return &mockProductCache{
		byID:   make(map[uuid.UUID]*entity.Product),
		bySlug: make(map[string]*entity.Product),
	}
}

func (m *mockProductCache) GetByID(_ context.Context, id uuid.UUID) (*entity.Product, error) {
	if m.getByIDErr != nil {
		return nil, m.getByIDErr
	}
	product, ok := m.byID[id]
	if !ok {
		return nil, nil
	}
	return product, nil
}

func (m *mockProductCache) GetBySlug(_ context.Context, slug string) (*entity.Product, error) {
	if m.getBySlugErr != nil {
		return nil, m.getBySlugErr
	}
	product, ok := m.bySlug[slug]
	if !ok {
		return nil, nil
	}
	return product, nil
}

func (m *mockProductCache) Set(_ context.Context, product *entity.Product, _ time.Duration) error {
	m.setCalls++
	if m.setErr != nil {
		return m.setErr
	}
	m.byID[product.ID] = product
	m.bySlug[product.Slug] = product
	return nil
}

func (m *mockProductCache) Invalidate(ctx context.Context, id uuid.UUID, slug string) error {
	m.invalidateCalls++
	if m.invalidateFn != nil {
		return m.invalidateFn(ctx, id, slug)
	}
	delete(m.byID, id)
	delete(m.bySlug, slug)
	return nil
}

func TestCachedProductRepository_FindByID_CacheHit(t *testing.T) {
	ctx := context.Background()
	productID := uuid.New()
	cached := &entity.Product{ID: productID, Name: "Cached", Slug: "cached-product"}

	repo := &mockProductRepository{}
	productCache := newMockProductCache()
	productCache.byID[productID] = cached

	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)

	found, err := cachedRepo.FindByID(ctx, productID)
	require.NoError(t, err)
	assert.Equal(t, cached, found)
	assert.Equal(t, 0, repo.findByIDCalls)
	assert.Equal(t, 0, productCache.setCalls)
}

func TestCachedProductRepository_FindByID_CacheMiss(t *testing.T) {
	ctx := context.Background()
	productID := uuid.New()
	dbProduct := &entity.Product{ID: productID, Name: "From DB", Slug: "from-db"}

	repo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return dbProduct, nil
		},
	}
	productCache := newMockProductCache()
	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)

	found, err := cachedRepo.FindByID(ctx, productID)
	require.NoError(t, err)
	assert.Equal(t, dbProduct, found)
	assert.Equal(t, 1, repo.findByIDCalls)
	assert.Equal(t, 1, productCache.setCalls)
	assert.Equal(t, dbProduct, productCache.byID[productID])
}

func TestCachedProductRepository_Update_InvalidatesCache(t *testing.T) {
	ctx := context.Background()
	productID := uuid.New()
	slug := "invalidate-me"
	product := &entity.Product{ID: productID, Name: "Updated", Slug: slug}

	repo := &mockProductRepository{}
	productCache := newMockProductCache()
	productCache.byID[productID] = &entity.Product{ID: productID, Slug: slug}
	productCache.bySlug[slug] = productCache.byID[productID]

	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)
	require.NoError(t, cachedRepo.Update(ctx, product))

	assert.Equal(t, 1, repo.updateCalls)
	assert.Equal(t, 1, productCache.invalidateCalls)
	_, ok := productCache.byID[productID]
	assert.False(t, ok)
}

func TestCachedProductRepository_FindByID_RedisErrorFallsBackToDB(t *testing.T) {
	ctx := context.Background()
	productID := uuid.New()
	dbProduct := &entity.Product{ID: productID, Name: "DB Fallback", Slug: "db-fallback"}

	repo := &mockProductRepository{
		findByIDFn: func(context.Context, uuid.UUID) (*entity.Product, error) {
			return dbProduct, nil
		},
	}
	productCache := newMockProductCache()
	productCache.getByIDErr = errors.New("redis connection refused")

	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)

	found, err := cachedRepo.FindByID(ctx, productID)
	require.NoError(t, err)
	assert.Equal(t, dbProduct, found)
	assert.Equal(t, 1, repo.findByIDCalls)
}

func TestCachedProductRepository_FindBySlug_CacheMiss(t *testing.T) {
	ctx := context.Background()
	productID := uuid.New()
	slug := "slug-miss"
	dbProduct := &entity.Product{ID: productID, Name: "Slug Product", Slug: slug}

	repo := &mockProductRepository{
		findBySlugFn: func(context.Context, string) (*entity.Product, error) {
			return dbProduct, nil
		},
	}
	productCache := newMockProductCache()
	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)

	found, err := cachedRepo.FindBySlug(ctx, slug)
	require.NoError(t, err)
	assert.Equal(t, dbProduct, found)
	assert.Equal(t, 1, repo.findBySlugCalls)
	assert.Equal(t, 1, productCache.setCalls)
}

func TestCachedProductRepository_Create_DoesNotCache(t *testing.T) {
	ctx := context.Background()
	product := &entity.Product{ID: uuid.New(), Name: "New", Slug: "new-product"}

	repo := &mockProductRepository{}
	productCache := newMockProductCache()
	cachedRepo := cache.NewCachedProductRepository(repo, productCache, nil, cache.DefaultProductCacheTTL)

	require.NoError(t, cachedRepo.Create(ctx, product))
	assert.Equal(t, 0, productCache.setCalls)
}
