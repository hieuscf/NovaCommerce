package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CatalogHandler serves catalog API endpoints (stub until business logic is implemented).
type CatalogHandler struct{}

// NewCatalogHandler creates a CatalogHandler.
func NewCatalogHandler() *CatalogHandler {
	return &CatalogHandler{}
}

func notImplemented(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, apiEnvelope{
		Data: nil,
		Meta: nil,
		Error: map[string]string{
			"code":    "NOT_IMPLEMENTED",
			"message": "endpoint not implemented yet",
		},
	})
}

// RegisterRoutes registers catalog API routes on /api/v1.
func (h *CatalogHandler) RegisterRoutes(r gin.IRouter) {
	v1 := r.Group("/api/v1")
	{
		categories := v1.Group("/categories")
		{
			categories.GET("", notImplemented)
			categories.POST("", notImplemented)
			categories.GET("/:id", notImplemented)
			categories.PUT("/:id", notImplemented)
			categories.GET("/:id/products", notImplemented)
		}

		brands := v1.Group("/brands")
		{
			brands.GET("", notImplemented)
			brands.POST("", notImplemented)
			brands.GET("/:id", notImplemented)
			brands.PUT("/:id", notImplemented)
		}

		inventory := v1.Group("/inventory")
		{
			inventory.GET("/:variant_id", notImplemented)
			inventory.PUT("/:variant_id", notImplemented)
			inventory.POST("/adjust", notImplemented)
			inventory.GET("/low-stock", notImplemented)
		}
	}
}
