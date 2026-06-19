package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/pkg/response"
	"github.com/novacommerce/pkg/validator"
)

// CategoryTreeResponse is the public tree node shape for categories.
type CategoryTreeResponse struct {
	ID        uuid.UUID              `json:"id"`
	Name      string                 `json:"name"`
	Slug      string                 `json:"slug"`
	ImageURL  string                 `json:"image_url,omitempty"`
	SortOrder int                    `json:"sort_order"`
	Children  []CategoryTreeResponse `json:"children,omitempty"`
}

// CategoryResponse is the full category payload for create/update responses.
type CategoryResponse struct {
	ID          uuid.UUID  `json:"id"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description string     `json:"description,omitempty"`
	ImageURL    string     `json:"image_url,omitempty"`
	SortOrder   int        `json:"sort_order"`
	IsActive    bool       `json:"is_active"`
}

// CategoryHandler serves category HTTP endpoints.
type CategoryHandler struct {
	service        *application.CategoryService
	productUseCase application.ProductUseCase
	validate       *validator.Validator
}

// NewCategoryHandler creates a CategoryHandler.
func NewCategoryHandler(
	service *application.CategoryService,
	productUseCase application.ProductUseCase,
) *CategoryHandler {
	return &CategoryHandler{
		service:        service,
		productUseCase: productUseCase,
		validate:       validator.New(),
	}
}

// GetCategoryTree returns the full category hierarchy.
func (h *CategoryHandler) GetCategoryTree(c *gin.Context) {
	tree, err := h.service.GetCategoryTree(c.Request.Context())
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Success(c.Writer, mapCategoryTree(tree))
}

// GetProductsByCategory lists products in a category and its descendants.
func (h *CategoryHandler) GetProductsByCategory(c *gin.Context) {
	categoryID, err := parseUUIDParam(c, "id")
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	var query CategoryProductsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Error(c.Writer, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&query); err != nil {
		response.Error(c.Writer, err)
		return
	}

	limit := query.Limit
	if limit <= 0 {
		limit = 20
	}
	page := pagination.CursorParams{
		Cursor: query.Cursor,
		Limit:  limit,
	}

	categoryIDs, err := h.service.GetProductsByCategory(c.Request.Context(), categoryID, page)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	output, err := h.productUseCase.ListProducts(c.Request.Context(), repository.ProductFilter{
		CategoryIDs: categoryIDs,
	}, page)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Paginated(c.Writer, output.Items, &response.Meta{
		Total:      output.Total,
		NextCursor: output.NextCursor,
		HasMore:    output.NextCursor != "",
	})
}

// CreateCategory creates a new category (admin only).
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c.Writer, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		response.Error(c.Writer, err)
		return
	}

	input, err := mapCreateCategoryRequest(req)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	category, err := h.service.CreateCategory(c.Request.Context(), input)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Created(c.Writer, mapCategoryResponse(category))
}

// UpdateCategory updates an existing category (admin only).
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	categoryID, err := parseUUIDParam(c, "id")
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c.Writer, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		response.Error(c.Writer, err)
		return
	}

	input, err := mapUpdateCategoryRequest(req)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	category, err := h.service.UpdateCategory(c.Request.Context(), categoryID, input)
	if err != nil {
		response.Error(c.Writer, err)
		return
	}

	response.Success(c.Writer, mapCategoryResponse(category))
}

func mapCategoryTree(categories []*domain.Category) []CategoryTreeResponse {
	result := make([]CategoryTreeResponse, 0, len(categories))
	for _, category := range categories {
		result = append(result, mapCategoryTreeNode(category))
	}
	return result
}

func mapCategoryTreeNode(category *domain.Category) CategoryTreeResponse {
	node := CategoryTreeResponse{
		ID:        category.ID,
		Name:      category.Name,
		Slug:      category.Slug,
		ImageURL:  category.ImageURL,
		SortOrder: category.SortOrder,
	}
	if len(category.Children) > 0 {
		node.Children = make([]CategoryTreeResponse, 0, len(category.Children))
		for _, child := range category.Children {
			node.Children = append(node.Children, mapCategoryTreeNode(child))
		}
	}
	return node
}

func mapCategoryResponse(category *domain.Category) CategoryResponse {
	return CategoryResponse{
		ID:          category.ID,
		ParentID:    category.ParentID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ImageURL:    category.ImageURL,
		SortOrder:   category.SortOrder,
		IsActive:    category.IsActive,
	}
}

func mapCreateCategoryRequest(req CreateCategoryRequest) (application.CreateCategoryInput, error) {
	input := application.CreateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
	}
	if req.ParentID != nil && *req.ParentID != "" {
		parentID, err := uuid.Parse(*req.ParentID)
		if err != nil {
			return application.CreateCategoryInput{}, apperrors.NewBadRequest("invalid parent_id")
		}
		input.ParentID = &parentID
	}
	return input, nil
}

func mapUpdateCategoryRequest(req UpdateCategoryRequest) (application.UpdateCategoryInput, error) {
	input := application.UpdateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
	}
	if req.ParentID != nil {
		parentID, err := uuid.Parse(*req.ParentID)
		if err != nil {
			return application.UpdateCategoryInput{}, apperrors.NewBadRequest("invalid parent_id")
		}
		input.ParentID = &parentID
	}
	return input, nil
}
