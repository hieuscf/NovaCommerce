package cache_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/cache"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockCategoryRepository struct {
	getAllFn func(ctx context.Context) ([]*domain.Category, error)
	getAllCalls int
}

func (m *mockCategoryRepository) GetAll(ctx context.Context) ([]*domain.Category, error) {
	m.getAllCalls++
	if m.getAllFn != nil {
		return m.getAllFn(ctx)
	}
	return nil, nil
}

func (m *mockCategoryRepository) GetByID(context.Context, uuid.UUID) (*domain.Category, error) {
	return nil, nil
}

func (m *mockCategoryRepository) GetDescendantIDs(context.Context, uuid.UUID) ([]uuid.UUID, error) {
	return nil, nil
}

func (m *mockCategoryRepository) Create(context.Context, *domain.Category) error { return nil }
func (m *mockCategoryRepository) Update(context.Context, *domain.Category) error { return nil }
func (m *mockCategoryRepository) ExistsBySlug(context.Context, string) (bool, error) {
	return false, nil
}

type mockBrandRepository struct {
	getAllFn    func(ctx context.Context, onlyActive bool) ([]*domain.Brand, error)
	getAllCalls int
}

func (m *mockBrandRepository) GetAll(ctx context.Context, onlyActive bool) ([]*domain.Brand, error) {
	m.getAllCalls++
	if m.getAllFn != nil {
		return m.getAllFn(ctx, onlyActive)
	}
	return nil, nil
}

func (m *mockBrandRepository) GetByID(context.Context, uuid.UUID) (*domain.Brand, error) {
	return nil, nil
}

func (m *mockBrandRepository) Create(context.Context, *domain.Brand) error { return nil }
func (m *mockBrandRepository) Update(context.Context, *domain.Brand) error { return nil }
func (m *mockBrandRepository) ExistsBySlug(context.Context, string) (bool, error) {
	return false, nil
}

var (
	_ repository.CategoryRepository = (*mockCategoryRepository)(nil)
	_ repository.BrandRepository    = (*mockBrandRepository)(nil)
)

func TestCachedCategoryRepository_GetAll_ReturnsFlatListOnMiss(t *testing.T) {
	ctx := context.Background()
	rootID := uuid.New()
	childID := uuid.New()
	parentID := rootID

	inner := &mockCategoryRepository{
		getAllFn: func(context.Context) ([]*domain.Category, error) {
			return []*domain.Category{
				{ID: rootID, Name: "Root", SortOrder: 1},
				{ID: childID, ParentID: &parentID, Name: "Child", SortOrder: 1},
			}, nil
		},
	}

	cachedRepo := cache.NewCachedCategoryRepository(inner, nil, nil, cache.DefaultCategoryCacheTTL)
	categories, err := cachedRepo.GetAll(ctx)
	require.NoError(t, err)
	require.Len(t, categories, 2)
	assert.Equal(t, 1, inner.getAllCalls)
}

func TestCachedBrandRepository_GetAll_OnlyActiveUsesDistinctKey(t *testing.T) {
	ctx := context.Background()
	activeBrand := &domain.Brand{ID: uuid.New(), Name: "Active", IsActive: true}

	inner := &mockBrandRepository{
		getAllFn: func(_ context.Context, onlyActive bool) ([]*domain.Brand, error) {
			if onlyActive {
				return []*domain.Brand{activeBrand}, nil
			}
			return []*domain.Brand{activeBrand, {ID: uuid.New(), Name: "Inactive", IsActive: false}}, nil
		},
	}

	cachedRepo := cache.NewCachedBrandRepository(inner, nil, nil, cache.DefaultBrandCacheTTL)

	active, err := cachedRepo.GetAll(ctx, true)
	require.NoError(t, err)
	require.Len(t, active, 1)

	all, err := cachedRepo.GetAll(ctx, false)
	require.NoError(t, err)
	require.Len(t, all, 2)
	assert.Equal(t, 2, inner.getAllCalls)
}
