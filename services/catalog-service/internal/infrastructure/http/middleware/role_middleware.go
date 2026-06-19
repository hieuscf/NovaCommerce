package middleware

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/novacommerce/pkg/errors"
	pkgmiddleware "github.com/novacommerce/pkg/middleware"
	"github.com/novacommerce/pkg/response"
)

const contextKeyGatewayUserRole = "user_role"

// GatewayAuth validates identity headers injected by Kong after JWT verification.
func GatewayAuth() gin.HandlerFunc {
	return pkgmiddleware.JWTAuth()
}

// RequireRole ensures the request carries an allowed role from the API gateway.
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetHeader("X-User-Role")
		if userRole == "" {
			userRole = c.GetString(contextKeyGatewayUserRole)
		}

		for _, role := range roles {
			if userRole == role {
				c.Set(contextKeyGatewayUserRole, userRole)
				c.Next()
				return
			}
		}

		response.Error(c.Writer, apperrors.NewForbidden("Insufficient permissions"))
		c.Abort()
	}
}
