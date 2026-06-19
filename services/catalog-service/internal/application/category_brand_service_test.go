package application_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockCategoryRepo struct {
	getAllFn           func(ctx context.Context) ([]*domain.Category, error)
	getByIDFn          func(ctx context.Context, id uuid.UUID) (*domain.Category, error)
	getDescendantIDsFn func(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error)
	createFn           func(ctx context.Context, category *domain.Category) error
	updateFn           func(ctx context.Context, category *domain.Category) error
	existsBySlugFn     func(ctx context.Context, slug string) (bool, error)
}

func (m *mockCategoryRepo) GetAll(ctx context.Context) ([]*domain.Category, error) {
	if m.getAllFn != nil {
		return m.getAllFn(ctx)
	}
	return nil, nil
}

func (m *mockCategoryRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(ctx, id)
	}
	return nil, apperrors.NewNotFound("category not found")
}

func (m *mockCategoryRepo) GetDescendantIDs(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error) {
	if m.getDescendantIDsFn != nil {
		return m.getDescendantIDsFn(ctx, id)
	}
	return nil, nil
}

func (m *mockCategoryRepo) Create(ctx context.Context, category *domain.Category) error {
	if m.createFn != nil {
		return m.createFn(ctx, category)
	}
	return nil
}

func (m *mockCategoryRepo) Update(ctx context.Context, category *domain.Category) error {
	if m.updateFn != nil {
		return m.updateFn(ctx, category)
	}
	return nil
}

func (m *mockCategoryRepo) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	if m.existsBySlugFn != nil {
		return m.existsBySlugFn(ctx, slug)
	}
	return false, nil
}

func TestCategoryService_GetCategoryTree(t *testing.T) {
	ctx := context.Background()
	rootID := uuid.New()
	childID := uuid.New()
	parentID := rootID

	repo := &mockCategoryRepo{
		getAllFn: func(context.Context) ([]*domain.Category, error) {
			return []*domain.Category{
				{ID: rootID, Name: "Root", SortOrder: 1},
				{ID: childID, ParentID: &parentID, Name: "Child", SortOrder: 1},
			}, nil
		},
	}

	svc := application.NewCategoryService(repo)
	tree, err := svc.GetCategoryTree(ctx)
	require.NoError(t, err)
	require.Len(t, tree, 1)
	require.Len(t, tree[0].Children, 1)
}

func TestCategoryService_CreateCategory_DuplicateSlug(t *testing.T) {
	ctx := context.Background()
	repo := &mockCategoryRepo{
		existsBySlugFn: func(context.Context, string) (bool, error) {
			return true, nil
		},
	}

	svc := application.NewCategoryService(repo)
	_, err := svc.CreateCategory(ctx, application.CreateCategoryInput{Name: "Electronics"})
	require.Error(t, err)
	conflict, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeConflict, conflict.Code)
}

func TestCategoryService_GetProductsByCategory_IncludesDescendants(t *testing.T) {
	ctx := context.Background()
	categoryID := uuid.New()
	childID := uuid.New()

	repo := &mockCategoryRepo{
		getByIDFn: func(context.Context, uuid.UUID) (*domain.Category, error) {
			return &domain.Category{ID: categoryID}, nil
		},
		getDescendantIDsFn: func(context.Context, uuid.UUID) ([]uuid.UUID, error) {
			return []uuid.UUID{childID}, nil
		},
	}

	svc := application.NewCategoryService(repo)
	ids, err := svc.GetProductsByCategory(ctx, categoryID, pagination.CursorParams{})
	require.NoError(t, err)
	assert.Equal(t, []uuid.UUID{categoryID, childID}, ids)
}

type mockBrandRepo struct {
	getAllFn       func(ctx context.Context, onlyActive bool) ([]*domain.Brand, error)
	getByIDFn      func(ctx context.Context, id uuid.UUID) (*domain.Brand, error)
	createFn       func(ctx context.Context, brand *domain.Brand) error
	updateFn       func(ctx context.Context, brand *domain.Brand) error
	existsBySlugFn func(ctx context.Context, slug string) (bool, error)
}

func (m *mockBrandRepo) GetAll(ctx context.Context, onlyActive bool) ([]*domain.Brand, error) {
	if m.getAllFn != nil {
		return m.getAllFn(ctx, onlyActive)
	}
	return nil, nil
}

func (m *mockBrandRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Brand, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(ctx, id)
	}
	return nil, apperrors.NewNotFound("brand not found")
}

func (m *mockBrandRepo) Create(ctx context.Context, brand *domain.Brand) error {
	if m.createFn != nil {
		return m.createFn(ctx, brand)
	}
	return nil
}

func (m *mockBrandRepo) Update(ctx context.Context, brand *domain.Brand) error {
	if m.updateFn != nil {
		return m.updateFn(ctx, brand)
	}
	return nil
}

func (m *mockBrandRepo) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	if m.existsBySlugFn != nil {
		return m.existsBySlugFn(ctx, slug)
	}
	return false, nil
}

func TestBrandService_CreateBrand_Success(t *testing.T) {
	ctx := context.Background()
	var created *domain.Brand

	repo := &mockBrandRepo{
		createFn: func(_ context.Context, brand *domain.Brand) error {
			created = brand
			return nil
		},
	}

	svc := application.NewBrandService(repo)
	brand, err := svc.CreateBrand(ctx, application.CreateBrandInput{Name: "Apple"})
	require.NoError(t, err)
	require.NotNil(t, brand)
	assert.Equal(t, "apple", brand.Slug)
	assert.True(t, brand.IsActive)
	assert.Equal(t, created, brand)
}

func TestBrandService_UpdateBrand_NotFound(t *testing.T) {
	ctx := context.Background()
	svc := application.NewBrandService(&mockBrandRepo{})

	_, err := svc.UpdateBrand(ctx, uuid.New(), application.UpdateBrandInput{})
	require.Error(t, err)
	notFound, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeNotFound, notFound.Code)
}
