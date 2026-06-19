package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/middleware"
	"github.com/stretchr/testify/assert"
)

func TestRequireRole_AllowsMatchingGatewayRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/categories", middleware.RequireRole("admin"), func(c *gin.Context) {
		c.Status(http.StatusCreated)
	})

	req := httptest.NewRequest(http.MethodPost, "/categories", nil)
	req.Header.Set("X-User-Role", "admin")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code)
}

func TestRequireRole_RejectsMissingRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/categories", middleware.RequireRole("admin"), func(c *gin.Context) {
		c.Status(http.StatusCreated)
	})

	req := httptest.NewRequest(http.MethodPost, "/categories", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusForbidden, rec.Code)
}
