package router

import (
	"github.com/gin-gonic/gin"
	"github.com/novacommerce/services/catalog-service/config"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/middleware"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/routes"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

// Dependencies groups HTTP router dependencies.
type Dependencies struct {
	Config          *config.Config
	HealthHandler   *handler.HealthHandler
	CatalogHandler  *handler.CatalogHandler
	CategoryHandler *handler.CategoryHandler
	BrandHandler    *handler.BrandHandler
	ProductHandler  *handler.ProductHandler
}

// SetupRouter builds the Gin engine with middleware and routes.
func SetupRouter(deps *Dependencies) *gin.Engine {
	if deps.Config.Server.Env != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	if deps.Config.Telemetry.Enabled {
		r.Use(otelgin.Middleware(deps.Config.Telemetry.ServiceName))
	}
	r.Use(middleware.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.RequestID())
	r.Use(middleware.InjectLogger())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	deps.HealthHandler.RegisterRoutes(r)
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	if deps.CatalogHandler != nil {
		deps.CatalogHandler.RegisterRoutes(r)
	}

	routes.RegisterCatalogRoutes(r, deps.CategoryHandler, deps.BrandHandler, deps.ProductHandler)

	if deps.ProductHandler != nil {
		deps.ProductHandler.RegisterRoutes(r)
	}

	return r
}
