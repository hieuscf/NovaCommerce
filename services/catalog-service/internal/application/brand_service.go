package application

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

// CreateBrandInput holds data for creating a brand.
type CreateBrandInput struct {
	Name        string
	Description string
	LogoURL     string
}

// UpdateBrandInput holds partial update fields for a brand.
type UpdateBrandInput struct {
	Name        *string
	Description *string
	LogoURL     *string
	IsActive    *bool
}

// BrandService implements brand use cases.
type BrandService struct {
	repo repository.BrandRepository
}

// NewBrandService creates a BrandService.
func NewBrandService(repo repository.BrandRepository) *BrandService {
	return &BrandService{repo: repo}
}

// GetAllBrands returns brands, optionally filtered to active only.
func (s *BrandService) GetAllBrands(ctx context.Context, onlyActive bool) ([]*domain.Brand, error) {
	return s.repo.GetAll(ctx, onlyActive)
}

// CreateBrand validates input, generates a slug, and persists a new brand.
func (s *BrandService) CreateBrand(ctx context.Context, input CreateBrandInput) (*domain.Brand, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, apperrors.NewBadRequest("brand name is required")
	}

	slug := generateSlug(name)
	if slug == "" {
		return nil, apperrors.NewBadRequest("brand name must contain at least one alphanumeric character")
	}

	exists, err := s.repo.ExistsBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperrors.NewConflict("brand slug already exists")
	}

	now := time.Now().UTC()
	brand := &domain.Brand{
		ID:          uuid.New(),
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(input.Description),
		LogoURL:     strings.TrimSpace(input.LogoURL),
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.repo.Create(ctx, brand); err != nil {
		return nil, err
	}
	return brand, nil
}

// UpdateBrand applies partial updates to an existing brand.
func (s *BrandService) UpdateBrand(ctx context.Context, id uuid.UUID, input UpdateBrandInput) (*domain.Brand, error) {
	brand, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, apperrors.NewBadRequest("brand name cannot be empty")
		}
		brand.Name = name

		newSlug := generateSlug(name)
		if newSlug == "" {
			return nil, apperrors.NewBadRequest("brand name must contain at least one alphanumeric character")
		}
		if newSlug != brand.Slug {
			exists, err := s.repo.ExistsBySlug(ctx, newSlug)
			if err != nil {
				return nil, err
			}
			if exists {
				return nil, apperrors.NewConflict("brand slug already exists")
			}
			brand.Slug = newSlug
		}
	}

	if input.Description != nil {
		brand.Description = strings.TrimSpace(*input.Description)
	}
	if input.LogoURL != nil {
		brand.LogoURL = strings.TrimSpace(*input.LogoURL)
	}
	if input.IsActive != nil {
		brand.IsActive = *input.IsActive
	}

	if err := s.repo.Update(ctx, brand); err != nil {
		return nil, err
	}
	return brand, nil
}
