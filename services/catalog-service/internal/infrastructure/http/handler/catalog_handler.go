package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CatalogHandler serves catalog API endpoints not yet implemented (inventory).
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

// RegisterRoutes registers inventory stub routes on /api/v1.
func (h *CatalogHandler) RegisterRoutes(r gin.IRouter) {
	v1 := r.Group("/api/v1")
	inventory := v1.Group("/inventory")
	{
		inventory.GET("/:variant_id", notImplemented)
		inventory.PUT("/:variant_id", notImplemented)
		inventory.POST("/adjust", notImplemented)
		inventory.GET("/low-stock", notImplemented)
	}
}
