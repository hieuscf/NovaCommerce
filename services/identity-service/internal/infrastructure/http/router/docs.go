package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func registerDocsRoutes(r *gin.Engine) {
	r.StaticFile("/openapi.yaml", "./api/openapi.yaml")
	r.Static("/docs", "./api/docs")

	r.GET("/swagger", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/docs/")
	})
}
