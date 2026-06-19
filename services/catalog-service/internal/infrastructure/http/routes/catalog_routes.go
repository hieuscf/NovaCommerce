package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/handler"
	catalogmiddleware "github.com/novacommerce/services/catalog-service/internal/infrastructure/http/middleware"
)

// RegisterCatalogRoutes registers category and brand API routes on /api/v1.
func RegisterCatalogRoutes(
	r *gin.Engine,
	categoryHandler *handler.CategoryHandler,
	brandHandler *handler.BrandHandler,
	_ *handler.ProductHandler,
) {
	if categoryHandler == nil && brandHandler == nil {
		return
	}

	v1 := r.Group("/api/v1")

	if categoryHandler != nil {
		categories := v1.Group("/categories")
		{
			categories.GET("", categoryHandler.GetCategoryTree)
			categories.GET("/:id/products", categoryHandler.GetProductsByCategory)

			admin := categories.Group("", catalogmiddleware.GatewayAuth(), catalogmiddleware.RequireRole("admin"))
			{
				admin.POST("", categoryHandler.CreateCategory)
				admin.PUT("/:id", categoryHandler.UpdateCategory)
			}
		}
	}

	if brandHandler != nil {
		brands := v1.Group("/brands")
		{
			brands.GET("", brandHandler.GetBrands)

			admin := brands.Group("", catalogmiddleware.GatewayAuth(), catalogmiddleware.RequireRole("admin"))
			{
				admin.POST("", brandHandler.CreateBrand)
				admin.PUT("/:id", brandHandler.UpdateBrand)
			}
		}
	}
}
