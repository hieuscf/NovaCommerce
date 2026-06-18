package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
	pkgmiddleware "github.com/novacommerce/pkg/middleware"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/pkg/validator"
)

// ProductHandler serves product HTTP endpoints.
type ProductHandler struct {
	productUseCase application.ProductUseCase
	validate       *validator.Validator
}

// NewProductHandler creates a ProductHandler.
func NewProductHandler(productUseCase application.ProductUseCase) *ProductHandler {
	return &ProductHandler{
		productUseCase: productUseCase,
		validate:       validator.New(),
	}
}

// RegisterRoutes registers product routes on /api/v1/products.
func (h *ProductHandler) RegisterRoutes(r gin.IRouter) {
	v1 := r.Group("/api/v1")
	products := v1.Group("/products")
	{
		products.GET("", h.ListProducts)
		products.GET("/slug/:slug", h.GetProductBySlug)
		products.GET("/:id", h.GetProduct)

		protected := products.Group("", pkgmiddleware.JWTAuth())
		seller := protected.Group("", pkgmiddleware.RequireRole("seller", "admin"))
		{
			seller.POST("", h.CreateProduct)
			seller.PUT("/:id", h.UpdateProduct)
			seller.DELETE("/:id", h.ArchiveProduct)
			seller.POST("/:id/images", h.AddImage)
			seller.DELETE("/:id/images/:image_id", h.RemoveImage)
			seller.POST("/:id/variants", h.AddVariant)
			seller.PUT("/:id/variants/:variant_id", h.UpdateVariant)
			seller.DELETE("/:id/variants/:variant_id", h.RemoveVariant)
		}
	}
}

// ListProducts godoc
// @Summary      Danh sách sản phẩm
// @Tags         products
// @Produce      json
// @Param        category_id query string false "Category ID"
// @Param        brand_id query string false "Brand ID"
// @Param        seller_id query string false "Seller ID"
// @Param        min_price query number false "Minimum variant price"
// @Param        max_price query number false "Maximum variant price"
// @Param        status query string false "Product status"
// @Param        q query string false "Search by name"
// @Param        cursor query string false "Pagination cursor"
// @Param        limit query int false "Page size"
// @Success      200 {object} response.Response
// @Failure      400 {object} response.Response
// @Router       /products [get]
func (h *ProductHandler) ListProducts(c *gin.Context) {
	var query ListProductsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&query); err != nil {
		respondError(c, err)
		return
	}

	filter, err := mapListProductsQuery(query)
	if err != nil {
		respondError(c, err)
		return
	}

	limit := query.Limit
	if limit <= 0 {
		limit = 20
	}

	output, err := h.productUseCase.ListProducts(c.Request.Context(), filter, pagination.CursorParams{
		Cursor: query.Cursor,
		Limit:  limit,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccessWithMeta(c, http.StatusOK, output.Items, map[string]any{
		"total":       output.Total,
		"next_cursor": output.NextCursor,
	})
}

// GetProduct godoc
// @Summary      Lấy sản phẩm theo ID
// @Tags         products
// @Produce      json
// @Param        id path string true "Product ID"
// @Success      200 {object} response.Response{data=application.ProductOutput}
// @Failure      400 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id} [get]
func (h *ProductHandler) GetProduct(c *gin.Context) {
	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.GetProductByID(c.Request.Context(), productID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, output)
}

// GetProductBySlug godoc
// @Summary      Lấy sản phẩm theo slug
// @Tags         products
// @Produce      json
// @Param        slug path string true "Product slug"
// @Success      200 {object} response.Response{data=application.ProductOutput}
// @Failure      404 {object} response.Response
// @Router       /products/slug/{slug} [get]
func (h *ProductHandler) GetProductBySlug(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	if slug == "" {
		respondError(c, apperrors.NewBadRequest("slug is required"))
		return
	}

	output, err := h.productUseCase.GetProductBySlug(c.Request.Context(), slug)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, output)
}

// CreateProduct godoc
// @Summary      Tạo sản phẩm mới
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body CreateProductRequest true "Product data"
// @Success      201 {object} response.Response{data=application.ProductOutput}
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      409 {object} response.Response
// @Router       /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		respondError(c, err)
		return
	}

	input, err := mapCreateProductRequest(req)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.CreateProduct(c.Request.Context(), sellerID, input)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusCreated, output)
}

// UpdateProduct godoc
// @Summary      Cập nhật sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        body body UpdateProductRequest true "Product update"
// @Success      200 {object} response.Response{data=application.ProductOutput}
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		respondError(c, err)
		return
	}

	input, err := mapUpdateProductRequest(req)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.UpdateProduct(c.Request.Context(), sellerID, productID, input)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, output)
}

// ArchiveProduct godoc
// @Summary      Lưu trữ (xóa mềm) sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Product ID"
// @Success      204
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id} [delete]
func (h *ProductHandler) ArchiveProduct(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.productUseCase.ArchiveProduct(c.Request.Context(), sellerID, productID); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

// AddImage godoc
// @Summary      Thêm ảnh sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        body body AddImageRequest true "Image data"
// @Success      201 {object} response.Response{data=application.ImageOutput}
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      422 {object} response.Response
// @Router       /products/{id}/images [post]
func (h *ProductHandler) AddImage(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}

	var req AddImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.AddProductImage(c.Request.Context(), sellerID, productID, application.AddImageInput{
		FileKey:  req.FileKey,
		AltText:  req.AltText,
		Position: req.Position,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusCreated, output)
}

// RemoveImage godoc
// @Summary      Xóa ảnh sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        image_id path string true "Image ID"
// @Success      204
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id}/images/{image_id} [delete]
func (h *ProductHandler) RemoveImage(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}
	imageID, err := parseUUIDParam(c, "image_id")
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.productUseCase.RemoveProductImage(c.Request.Context(), sellerID, productID, imageID); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

// AddVariant godoc
// @Summary      Thêm biến thể sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        body body AddVariantRequest true "Variant data"
// @Success      201 {object} response.Response{data=application.VariantOutput}
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      409 {object} response.Response
// @Router       /products/{id}/variants [post]
func (h *ProductHandler) AddVariant(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}

	var req AddVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		respondError(c, err)
		return
	}

	input, err := mapAddVariantRequest(req)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.AddVariant(c.Request.Context(), sellerID, productID, input)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusCreated, output)
}

// UpdateVariant godoc
// @Summary      Cập nhật biến thể sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        variant_id path string true "Variant ID"
// @Param        body body UpdateVariantRequest true "Variant update"
// @Success      200 {object} response.Response{data=application.VariantOutput}
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id}/variants/{variant_id} [put]
func (h *ProductHandler) UpdateVariant(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}
	variantID, err := parseUUIDParam(c, "variant_id")
	if err != nil {
		respondError(c, err)
		return
	}

	var req UpdateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}
	if err := h.validate.Validate(&req); err != nil {
		respondError(c, err)
		return
	}

	input, err := mapUpdateVariantRequest(req)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.productUseCase.UpdateVariant(c.Request.Context(), sellerID, productID, variantID, input)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, http.StatusOK, output)
}

// RemoveVariant godoc
// @Summary      Xóa biến thể sản phẩm
// @Tags         products
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Product ID"
// @Param        variant_id path string true "Variant ID"
// @Success      204
// @Failure      400 {object} response.Response
// @Failure      403 {object} response.Response
// @Failure      404 {object} response.Response
// @Router       /products/{id}/variants/{variant_id} [delete]
func (h *ProductHandler) RemoveVariant(c *gin.Context) {
	sellerID, err := pkgmiddleware.GetUserUUID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	productID, err := parseUUIDParam(c, "id")
	if err != nil {
		respondError(c, err)
		return
	}
	variantID, err := parseUUIDParam(c, "variant_id")
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.productUseCase.RemoveVariant(c.Request.Context(), sellerID, productID, variantID); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

func parseUUIDParam(c *gin.Context, name string) (uuid.UUID, error) {
	raw := strings.TrimSpace(c.Param(name))
	if raw == "" {
		return uuid.Nil, apperrors.NewBadRequest(name + " is required")
	}
	parsed, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("invalid " + name)
	}
	return parsed, nil
}

func mapCreateProductRequest(req CreateProductRequest) (application.CreateProductInput, error) {
	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return application.CreateProductInput{}, apperrors.NewBadRequest("invalid category_id")
	}

	input := application.CreateProductInput{
		Name:        req.Name,
		Description: req.Description,
		CategoryID:  categoryID,
		Variants:    make([]application.CreateVariantInput, 0, len(req.Variants)),
	}

	if req.BrandID != "" {
		brandID, err := uuid.Parse(req.BrandID)
		if err != nil {
			return application.CreateProductInput{}, apperrors.NewBadRequest("invalid brand_id")
		}
		input.BrandID = &brandID
	}

	for _, variant := range req.Variants {
		attrs, err := parseAttributeMap(variant.Attributes)
		if err != nil {
			return application.CreateProductInput{}, err
		}
		input.Variants = append(input.Variants, application.CreateVariantInput{
			SKU:          variant.SKU,
			Price:        variant.Price,
			ComparePrice: variant.ComparePrice,
			Weight:       variant.Weight,
			Attributes:   attrs,
		})
	}

	return input, nil
}

func mapUpdateProductRequest(req UpdateProductRequest) (application.UpdateProductInput, error) {
	input := application.UpdateProductInput{
		Name:        req.Name,
		Description: req.Description,
	}

	if req.CategoryID != nil {
		categoryID, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			return application.UpdateProductInput{}, apperrors.NewBadRequest("invalid category_id")
		}
		input.CategoryID = &categoryID
	}
	if req.BrandID != nil {
		brandID, err := uuid.Parse(*req.BrandID)
		if err != nil {
			return application.UpdateProductInput{}, apperrors.NewBadRequest("invalid brand_id")
		}
		input.BrandID = &brandID
	}
	if req.Status != nil {
		status := entity.ProductStatus(*req.Status)
		input.Status = &status
	}

	return input, nil
}

func mapAddVariantRequest(req AddVariantRequest) (application.AddVariantInput, error) {
	attrs, err := parseAttributeMap(req.Attributes)
	if err != nil {
		return application.AddVariantInput{}, err
	}
	return application.AddVariantInput{
		SKU:          req.SKU,
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		Weight:       req.Weight,
		Attributes:   attrs,
	}, nil
}

func mapUpdateVariantRequest(req UpdateVariantRequest) (application.UpdateVariantInput, error) {
	input := application.UpdateVariantInput{
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		Weight:       req.Weight,
	}
	if req.Status != nil {
		status := entity.ProductStatus(*req.Status)
		input.Status = &status
	}
	return input, nil
}

func mapListProductsQuery(query ListProductsQuery) (repository.ProductFilter, error) {
	filter := repository.ProductFilter{Search: query.Search}

	if query.CategoryID != "" {
		id, err := uuid.Parse(query.CategoryID)
		if err != nil {
			return filter, apperrors.NewBadRequest("invalid category_id")
		}
		filter.CategoryID = &id
	}
	if query.BrandID != "" {
		id, err := uuid.Parse(query.BrandID)
		if err != nil {
			return filter, apperrors.NewBadRequest("invalid brand_id")
		}
		filter.BrandID = &id
	}
	if query.SellerID != "" {
		id, err := uuid.Parse(query.SellerID)
		if err != nil {
			return filter, apperrors.NewBadRequest("invalid seller_id")
		}
		filter.SellerID = &id
	}
	if query.Status != "" {
		status := entity.ProductStatus(query.Status)
		filter.Status = &status
	}
	if query.MinPrice > 0 {
		minPrice := query.MinPrice
		filter.MinPrice = &minPrice
	}
	if query.MaxPrice > 0 {
		maxPrice := query.MaxPrice
		filter.MaxPrice = &maxPrice
	}

	return filter, nil
}

func parseAttributeMap(raw map[string]string) (map[uuid.UUID]uuid.UUID, error) {
	if len(raw) == 0 {
		return nil, nil
	}

	result := make(map[uuid.UUID]uuid.UUID, len(raw))
	for attrID, valueID := range raw {
		parsedAttrID, err := uuid.Parse(attrID)
		if err != nil {
			return nil, apperrors.NewBadRequest("invalid attribute id in attributes map")
		}
		parsedValueID, err := uuid.Parse(valueID)
		if err != nil {
			return nil, apperrors.NewBadRequest("invalid attribute value id in attributes map")
		}
		result[parsedAttrID] = parsedValueID
	}
	return result, nil
}
