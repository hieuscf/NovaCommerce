package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/novacommerce/services/catalog-service/internal/application/service"
)

// HealthHandler serves health check endpoints.
type HealthHandler struct {
	healthService *service.HealthService
}

// NewHealthHandler creates a HealthHandler.
func NewHealthHandler(healthService *service.HealthService) *HealthHandler {
	return &HealthHandler{healthService: healthService}
}

// Check handles GET /health.
func (h *HealthHandler) Check(c *gin.Context) {
	result, healthy := h.healthService.Check(c.Request.Context())

	statusCode := http.StatusOK
	if !healthy {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, result)
}

// RegisterRoutes registers health routes on a Gin router group.
func (h *HealthHandler) RegisterRoutes(r gin.IRoutes) {
	r.GET("/health", h.Check)
}
