package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	apperrors "github.com/novacommerce/pkg/errors"
)

type authErrorEnvelope struct {
	Data  any `json:"data"`
	Meta  any `json:"meta"`
	Error any `json:"error"`
}

func writeAuthError(c *gin.Context, appErr *apperrors.AppError) {
	c.JSON(appErr.HTTPStatus, authErrorEnvelope{
		Data: nil,
		Meta: nil,
		Error: map[string]any{
			"code":    appErr.Code,
			"message": appErr.Message,
			"details": appErr.Details,
		},
	})
}

const (
	contextKeyUserID = "userID"
	contextKeyEmail  = "email"
	contextKeyRoles  = "roles"
)

// JWTAuthMiddleware validates Bearer JWT access tokens and stores claims in context.
func JWTAuthMiddleware(jwtService port.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractBearerToken(c.GetHeader("Authorization"))
		if token == "" {
			writeAuthError(c, apperrors.NewUnauthorized("missing or invalid authorization header"))
			c.Abort()
			return
		}

		claims, err := jwtService.ValidateAccessToken(token)
		if err != nil {
			writeAuthError(c, apperrors.NewUnauthorized("invalid or expired token"))
			c.Abort()
			return
		}

		c.Set(contextKeyUserID, claims.UserID)
		c.Set(contextKeyEmail, claims.Email)
		c.Set(contextKeyRoles, claims.Roles)
		c.Next()
	}
}

// GetCurrentUserID returns the authenticated user ID from gin context.
func GetCurrentUserID(c *gin.Context) (uuid.UUID, error) {
	value, exists := c.Get(contextKeyUserID)
	if !exists {
		return uuid.Nil, apperrors.NewUnauthorized("unauthorized")
	}

	userID, ok := value.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return uuid.Nil, apperrors.NewUnauthorized("unauthorized")
	}

	return userID, nil
}

// GetCurrentUserRoles returns role names attached to the authenticated user.
func GetCurrentUserRoles(c *gin.Context) []string {
	value, exists := c.Get(contextKeyRoles)
	if !exists {
		return nil
	}

	roles, ok := value.([]string)
	if !ok {
		return nil
	}

	return roles
}

// HasRole reports whether the authenticated user has the given role.
func HasRole(c *gin.Context, role string) bool {
	for _, r := range GetCurrentUserRoles(c) {
		if r == role {
			return true
		}
	}
	return false
}

// RequireRole allows the request only when the authenticated user has one of the required roles.
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[role] = struct{}{}
	}

	return func(c *gin.Context) {
		currentRoles := GetCurrentUserRoles(c)
		for _, role := range currentRoles {
			if _, ok := allowed[role]; ok {
				c.Next()
				return
			}
		}

		writeAuthError(c, apperrors.NewForbidden("insufficient permissions"))
		c.Abort()
	}
}

// RequireSelfOrAdmin allows the request when the authenticated user matches the
// path parameter or holds the admin role.
func RequireSelfOrAdmin(paramName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		targetID := c.Param(paramName)
		if targetID == "" {
			writeAuthError(c, apperrors.NewBadRequest("missing user id"))
			c.Abort()
			return
		}

		currentUserID, err := GetCurrentUserID(c)
		if err != nil {
			writeAuthError(c, apperrors.NewUnauthorized("unauthorized"))
			c.Abort()
			return
		}

		if currentUserID.String() == targetID {
			c.Next()
			return
		}

		if HasRole(c, "admin") {
			c.Next()
			return
		}

		writeAuthError(c, apperrors.NewForbidden("insufficient permissions"))
		c.Abort()
	}
}

func extractBearerToken(header string) string {
	const prefix = "Bearer "
	if len(header) < len(prefix) || header[:len(prefix)] != prefix {
		return ""
	}
	return header[len(prefix):]
}
