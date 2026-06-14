package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/novacommerce/identity-service/internal/application/service"
)

// HealthHandler serves health check endpoints.
type HealthHandler struct {
	healthService *service.HealthService
}

// NewHealthHandler creates a HealthHandler.
func NewHealthHandler(healthService *service.HealthService) *HealthHandler {
	return &HealthHandler{healthService: healthService}
}

type healthEnvelope struct {
	Data  service.HealthResult `json:"data"`
	Meta  any                  `json:"meta"`
	Error any                  `json:"error"`
}

// Check handles GET /health.
func (h *HealthHandler) Check(c *gin.Context) {
	result, allFailed := h.healthService.Check(c.Request.Context())

	statusCode := http.StatusOK
	if allFailed {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, healthEnvelope{
		Data:  result,
		Meta:  nil,
		Error: nil,
	})
}

// RegisterRoutes registers health routes on a Gin router group.
func (h *HealthHandler) RegisterRoutes(r gin.IRoutes) {
	r.GET("/health", h.Check)
}
