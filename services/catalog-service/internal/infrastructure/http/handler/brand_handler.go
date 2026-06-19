package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/response"
	"github.com/novacommerce/pkg/validator"
)

// BrandResponse is the public brand payload.
type BrandResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description,omitempty"`
	LogoURL     string    `json:"logo_url,omitempty"`
	IsActive    bool      `json:"is_active"`
}

// BrandHandler serves brand HTTP endpoints.
type BrandHandler struct {
	service  *application.BrandService
	validate *validator.Validator
}

// NewBrandHandler creates a BrandHandler.
func NewBrandHandler(service *application.BrandService) *BrandHandler {
	return &BrandHandler{
		service:  service,
		validate: validator.New(),
	}
}

// GetBrands returns brands, optionally filtered to active only.
func (h *BrandHandler) GetBrands(c *gin.Context) {
	onlyActive, err := parseActiveQuery(c.Query("active"))
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	brands, err := h.service.GetAllBrands(c.Request.Context(), onlyActive)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Success(c.Writer, mapBrands(brands))
}

// CreateBrand creates a new brand (admin only).
func (h *BrandHandler) CreateBrand(c *gin.Context) {
	var req CreateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c.Writer, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		response.Error(c.Writer, err)
		return
	}

	brand, err := h.service.CreateBrand(c.Request.Context(), application.CreateBrandInput{
		Name:        req.Name,
		Description: req.Description,
		LogoURL:     req.LogoURL,
	})
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Created(c.Writer, mapBrand(brand))
}

// UpdateBrand updates an existing brand (admin only).
func (h *BrandHandler) UpdateBrand(c *gin.Context) {
	brandID, err := parseUUIDParam(c, "id")
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	var req UpdateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c.Writer, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		response.Error(c.Writer, err)
		return
	}

	brand, err := h.service.UpdateBrand(c.Request.Context(), brandID, application.UpdateBrandInput{
		Name:        req.Name,
		Description: req.Description,
		LogoURL:     req.LogoURL,
		IsActive:    req.IsActive,
	})
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Success(c.Writer, mapBrand(brand))
}

func parseActiveQuery(raw string) (bool, error) {
	if raw == "" {
		return false, nil
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return false, apperrors.NewBadRequest("active must be a boolean")
	}
	return value, nil
}

func mapBrands(brands []*domain.Brand) []BrandResponse {
	result := make([]BrandResponse, 0, len(brands))
	for _, brand := range brands {
		result = append(result, mapBrand(brand))
	}
	return result
}

func mapBrand(brand *domain.Brand) BrandResponse {
	return BrandResponse{
		ID:          brand.ID,
		Name:        brand.Name,
		Slug:        brand.Slug,
		Description: brand.Description,
		LogoURL:     brand.LogoURL,
		IsActive:    brand.IsActive,
	}
}
