package application

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

// CreateCategoryInput holds data for creating a category.
type CreateCategoryInput struct {
	Name        string
	ParentID    *uuid.UUID
	Description string
	ImageURL    string
	SortOrder   int
}

// UpdateCategoryInput holds partial update fields for a category.
type UpdateCategoryInput struct {
	Name        *string
	ParentID    *uuid.UUID
	Description *string
	ImageURL    *string
	SortOrder   *int
	IsActive    *bool
}

// CategoryService implements category use cases.
type CategoryService struct {
	repo repository.CategoryRepository
}

// NewCategoryService creates a CategoryService.
func NewCategoryService(repo repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

// GetCategoryTree returns the full category hierarchy.
func (s *CategoryService) GetCategoryTree(ctx context.Context) ([]*domain.Category, error) {
	flat, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return domain.BuildCategoryTree(flat), nil
}

// GetProductsByCategory resolves category and descendant IDs for product filtering.
// Product listing is handled separately by the product service using the returned IDs.
func (s *CategoryService) GetProductsByCategory(
	ctx context.Context,
	categoryID uuid.UUID,
	_ pagination.CursorParams,
) ([]uuid.UUID, error) {
	if _, err := s.repo.GetByID(ctx, categoryID); err != nil {
		return nil, err
	}

	descendantIDs, err := s.repo.GetDescendantIDs(ctx, categoryID)
	if err != nil {
		return nil, err
	}

	ids := make([]uuid.UUID, 0, len(descendantIDs)+1)
	ids = append(ids, categoryID)
	ids = append(ids, descendantIDs...)
	return ids, nil
}

// CreateCategory validates input, generates a slug, and persists a new category.
func (s *CategoryService) CreateCategory(ctx context.Context, input CreateCategoryInput) (*domain.Category, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, apperrors.NewBadRequest("category name is required")
	}

	if input.ParentID != nil {
		if _, err := s.repo.GetByID(ctx, *input.ParentID); err != nil {
			return nil, err
		}
	}

	slug := generateSlug(name)
	if slug == "" {
		return nil, apperrors.NewBadRequest("category name must contain at least one alphanumeric character")
	}

	exists, err := s.repo.ExistsBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperrors.NewConflict("category slug already exists")
	}

	now := time.Now().UTC()
	category := &domain.Category{
		ID:          uuid.New(),
		ParentID:    input.ParentID,
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(input.Description),
		ImageURL:    strings.TrimSpace(input.ImageURL),
		SortOrder:   input.SortOrder,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.repo.Create(ctx, category); err != nil {
		return nil, err
	}
	return category, nil
}

// UpdateCategory applies partial updates to an existing category.
func (s *CategoryService) UpdateCategory(
	ctx context.Context,
	id uuid.UUID,
	input UpdateCategoryInput,
) (*domain.Category, error) {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, apperrors.NewBadRequest("category name cannot be empty")
		}
		category.Name = name

		newSlug := generateSlug(name)
		if newSlug == "" {
			return nil, apperrors.NewBadRequest("category name must contain at least one alphanumeric character")
		}
		if newSlug != category.Slug {
			exists, err := s.repo.ExistsBySlug(ctx, newSlug)
			if err != nil {
				return nil, err
			}
			if exists {
				return nil, apperrors.NewConflict("category slug already exists")
			}
			category.Slug = newSlug
		}
	}

	if input.ParentID != nil {
		if *input.ParentID == id {
			return nil, apperrors.NewBadRequest("category cannot be its own parent")
		}
		if _, err := s.repo.GetByID(ctx, *input.ParentID); err != nil {
			return nil, err
		}
		category.ParentID = input.ParentID
	}

	if input.Description != nil {
		category.Description = strings.TrimSpace(*input.Description)
	}
	if input.ImageURL != nil {
		category.ImageURL = strings.TrimSpace(*input.ImageURL)
	}
	if input.SortOrder != nil {
		category.SortOrder = *input.SortOrder
	}
	if input.IsActive != nil {
		category.IsActive = *input.IsActive
	}

	if err := s.repo.Update(ctx, category); err != nil {
		return nil, err
	}
	return category, nil
}
