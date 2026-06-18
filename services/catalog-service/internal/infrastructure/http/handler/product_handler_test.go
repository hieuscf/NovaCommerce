package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/pkg/pagination"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type apiEnvelope struct {
	Data  json.RawMessage `json:"data"`
	Meta  any             `json:"meta"`
	Error *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

type mockProductUseCase struct {
	getByIDFn      func(ctx context.Context, id uuid.UUID) (*application.ProductOutput, error)
	updateFn       func(ctx context.Context, sellerID uuid.UUID, id uuid.UUID, input application.UpdateProductInput) (*application.ProductOutput, error)
	archiveFn      func(ctx context.Context, sellerID uuid.UUID, id uuid.UUID) error
	addImageFn     func(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input application.AddImageInput) (*application.ImageOutput, error)
	addVariantFn   func(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input application.AddVariantInput) (*application.VariantOutput, error)
	removeVariantFn func(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, variantID uuid.UUID) error
}

func (m *mockProductUseCase) CreateProduct(context.Context, uuid.UUID, application.CreateProductInput) (*application.ProductOutput, error) {
	return nil, nil
}
func (m *mockProductUseCase) GetProductBySlug(context.Context, string) (*application.ProductOutput, error) {
	return nil, nil
}
func (m *mockProductUseCase) ListProducts(context.Context, repository.ProductFilter, pagination.CursorParams) (*application.ProductListOutput, error) {
	return nil, nil
}
func (m *mockProductUseCase) RemoveProductImage(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error {
	return nil
}
func (m *mockProductUseCase) UpdateVariant(context.Context, uuid.UUID, uuid.UUID, uuid.UUID, application.UpdateVariantInput) (*application.VariantOutput, error) {
	return nil, nil
}

func (m *mockProductUseCase) GetProductByID(ctx context.Context, id uuid.UUID) (*application.ProductOutput, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(ctx, id)
	}
	return nil, entity.ErrProductNotFound
}

func (m *mockProductUseCase) UpdateProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID, input application.UpdateProductInput) (*application.ProductOutput, error) {
	if m.updateFn != nil {
		return m.updateFn(ctx, sellerID, id, input)
	}
	return nil, nil
}

func (m *mockProductUseCase) ArchiveProduct(ctx context.Context, sellerID uuid.UUID, id uuid.UUID) error {
	if m.archiveFn != nil {
		return m.archiveFn(ctx, sellerID, id)
	}
	return nil
}

func (m *mockProductUseCase) AddProductImage(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input application.AddImageInput) (*application.ImageOutput, error) {
	if m.addImageFn != nil {
		return m.addImageFn(ctx, sellerID, productID, input)
	}
	return nil, nil
}

func (m *mockProductUseCase) AddVariant(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, input application.AddVariantInput) (*application.VariantOutput, error) {
	if m.addVariantFn != nil {
		return m.addVariantFn(ctx, sellerID, productID, input)
	}
	return nil, nil
}

func (m *mockProductUseCase) RemoveVariant(ctx context.Context, sellerID uuid.UUID, productID uuid.UUID, variantID uuid.UUID) error {
	if m.removeVariantFn != nil {
		return m.removeVariantFn(ctx, sellerID, productID, variantID)
	}
	return nil
}

func setupProductRouter(uc application.ProductUseCase) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	handler.NewProductHandler(uc).RegisterRoutes(r)
	return r
}

func decodeEnvelope(t *testing.T, body *bytes.Buffer) apiEnvelope {
	t.Helper()
	var envelope apiEnvelope
	require.NoError(t, json.Unmarshal(body.Bytes(), &envelope))
	return envelope
}

func TestProductHandler_GetProduct_InvalidUUID(t *testing.T) {
	r := setupProductRouter(&mockProductUseCase{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/products/not-a-uuid", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	require.NotNil(t, envelope.Error)
	assert.Equal(t, "BAD_REQUEST", envelope.Error.Code)
	assert.Equal(t, "null", string(envelope.Data))
}

func TestProductHandler_GetProduct_NotFound(t *testing.T) {
	productID := uuid.New()
	r := setupProductRouter(&mockProductUseCase{
		getByIDFn: func(context.Context, uuid.UUID) (*application.ProductOutput, error) {
			return nil, entity.ErrProductNotFound
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/products/"+productID.String(), nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	require.NotNil(t, envelope.Error)
	assert.Equal(t, "PRODUCT_NOT_FOUND", envelope.Error.Code)
}

func TestProductHandler_GetProduct_SuccessResponseFormat(t *testing.T) {
	productID := uuid.New()
	r := setupProductRouter(&mockProductUseCase{
		getByIDFn: func(context.Context, uuid.UUID) (*application.ProductOutput, error) {
			return &application.ProductOutput{
				ID:     productID,
				Name:   "Test Product",
				Status: "active",
			}, nil
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/products/"+productID.String(), nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	assert.NotNil(t, envelope.Data)
	assert.Nil(t, envelope.Error)
	assert.Nil(t, envelope.Meta)
}

func TestProductHandler_UpdateProduct_Forbidden(t *testing.T) {
	sellerID := uuid.New()
	productID := uuid.New()

	r := setupProductRouter(&mockProductUseCase{
		updateFn: func(context.Context, uuid.UUID, uuid.UUID, application.UpdateProductInput) (*application.ProductOutput, error) {
			return nil, entity.ErrProductForbidden
		},
	})

	body := []byte(`{"name":"Updated Product"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/products/"+productID.String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User-ID", sellerID.String())
	req.Header.Set("X-User-Role", "seller")

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusForbidden, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	require.NotNil(t, envelope.Error)
	assert.Equal(t, "PRODUCT_FORBIDDEN", envelope.Error.Code)
}

func TestProductHandler_AddVariant_DuplicateSKU(t *testing.T) {
	sellerID := uuid.New()
	productID := uuid.New()

	r := setupProductRouter(&mockProductUseCase{
		addVariantFn: func(context.Context, uuid.UUID, uuid.UUID, application.AddVariantInput) (*application.VariantOutput, error) {
			return nil, entity.ErrDuplicateSKU
		},
	})

	body := []byte(`{"sku":"DUP-001","price":10}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/products/"+productID.String()+"/variants", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User-ID", sellerID.String())
	req.Header.Set("X-User-Role", "seller")

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusConflict, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	require.NotNil(t, envelope.Error)
	assert.Equal(t, "DUPLICATE_SKU", envelope.Error.Code)
}

func TestProductHandler_AddImage_MaxImagesExceeded(t *testing.T) {
	sellerID := uuid.New()
	productID := uuid.New()

	r := setupProductRouter(&mockProductUseCase{
		addImageFn: func(context.Context, uuid.UUID, uuid.UUID, application.AddImageInput) (*application.ImageOutput, error) {
			return nil, entity.ErrMaxImagesExceeded
		},
	})

	body := []byte(`{"file_key":"image.jpg","position":0}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/products/"+productID.String()+"/images", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User-ID", sellerID.String())
	req.Header.Set("X-User-Role", "seller")

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnprocessableEntity, rec.Code)
	envelope := decodeEnvelope(t, rec.Body)
	require.NotNil(t, envelope.Error)
	assert.Equal(t, "MAX_IMAGES_EXCEEDED", envelope.Error.Code)
}

func TestProductHandler_RemoveVariant_NotFound(t *testing.T) {
	sellerID := uuid.New()
	productID := uuid.New()
	variantID := uuid.New()

	r := setupProductRouter(&mockProductUseCase{
		removeVariantFn: func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error {
			return entity.ErrVariantNotFound
		},
	})

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/products/"+productID.String()+"/variants/"+variantID.String(), nil)
	req.Header.Set("X-User-ID", sellerID.String())
	req.Header.Set("X-User-Role", "seller")

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
}

func TestProductHandler_ArchiveProduct_MissingAuth(t *testing.T) {
	productID := uuid.New()
	r := setupProductRouter(&mockProductUseCase{})

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/products/"+productID.String(), nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestProductHandler_ArchiveProduct_ForbiddenRole(t *testing.T) {
	productID := uuid.New()
	r := setupProductRouter(&mockProductUseCase{})

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/products/"+productID.String(), nil)
	req.Header.Set("X-User-ID", uuid.New().String())
	req.Header.Set("X-User-Role", "buyer")

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusForbidden, rec.Code)
}
