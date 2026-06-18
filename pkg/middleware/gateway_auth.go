package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/response"
)

// JWTAuth reads authenticated user identity injected by the API gateway.
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			response.Error(c.Writer, apperrors.NewUnauthorized("Missing user identity"))
			c.Abort()
			return
		}
		if _, err := uuid.Parse(userID); err != nil {
			response.Error(c.Writer, apperrors.NewUnauthorized("Invalid user identity"))
			c.Abort()
			return
		}

		c.Set(ContextKeyUserID, userID)
		c.Set(ContextKeyUserRole, c.GetHeader("X-User-Role"))
		c.Next()
	}
}

// GetUserUUID returns the authenticated user ID as a UUID.
func GetUserUUID(c *gin.Context) (uuid.UUID, error) {
	userID, ok := GetUserID(c)
	if !ok {
		return uuid.Nil, apperrors.NewUnauthorized("Missing user identity")
	}
	parsed, err := uuid.Parse(userID)
	if err != nil {
		return uuid.Nil, apperrors.NewUnauthorized("Invalid user identity")
	}
	return parsed, nil
}

// AbortWithError writes an error response and aborts the request.
func AbortWithError(c *gin.Context, status int, err error) {
	if appErr, ok := apperrors.IsAppError(err); ok {
		response.Error(c.Writer, appErr)
	} else {
		response.ErrorWithStatus(c.Writer, status, apperrors.ErrCodeInternal, err.Error())
	}
	c.Abort()
}

// Ensure OPTIONS requests are handled consistently for auth groups.
func allowPreflight(c *gin.Context) bool {
	if c.Request.Method == http.MethodOptions {
		c.Status(http.StatusNoContent)
		return true
	}
	return false
}
