package router

import (
	"github.com/gin-gonic/gin"
	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

// NewRouter builds the Gin engine with middleware and routes.
func NewRouter(cfg *config.Config, healthHandler *handler.HealthHandler) *gin.Engine {
	if cfg.App.Env != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(otelgin.Middleware(cfg.Telemetry.ServiceName))
	r.Use(middleware.RequestID())
	r.Use(middleware.InjectLogger())
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())

	healthHandler.RegisterRoutes(r)

	v1 := r.Group("/api/v1")
	_ = v1

	return r
}
