package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/usecase"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
)

// UserHandler serves user profile HTTP endpoints.
type UserHandler struct {
	userUseCase usecase.UserUseCase
}

// NewUserHandler creates a UserHandler.
func NewUserHandler(userUseCase usecase.UserUseCase) *UserHandler {
	return &UserHandler{userUseCase: userUseCase}
}

type updateProfileRequest struct {
	FullName  *string `json:"full_name"`
	Phone     *string `json:"phone"`
	AvatarURL *string `json:"avatar_url"`
}

type updateUserStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// GetUser handles GET /api/v1/users/:id.
func (h *UserHandler) GetUser(c *gin.Context) {
	userID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.userUseCase.GetUser(c.Request.Context(), userID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

// ListUsers handles GET /api/v1/users.
func (h *UserHandler) ListUsers(c *gin.Context) {
	params, err := pagination.ParseParams(c.Request)
	if err != nil {
		respondError(c, apperrors.NewBadRequest(err.Error()))
		return
	}

	result, err := h.userUseCase.ListUsers(c.Request.Context(), usecase.ListUsersInput{
		Status: c.Query("status"),
		Role:   c.Query("role"),
		Search: c.Query("search"),
		Cursor: params.Cursor,
		Limit:  params.Limit,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccessWithMeta(c, 200, result.Users, map[string]any{
		"next_cursor": result.NextCursor,
		"has_more":    result.HasMore,
	})
}

// UpdateProfile handles PUT /api/v1/users/:id.
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	output, err := h.userUseCase.UpdateProfile(c.Request.Context(), userID, usecase.UpdateProfileInput{
		FullName:  req.FullName,
		Phone:     req.Phone,
		AvatarURL: req.AvatarURL,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

// UpdateUserStatus handles PUT /api/v1/users/:id/status.
func (h *UserHandler) UpdateUserStatus(c *gin.Context) {
	targetID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	actorID, err := middleware.GetCurrentUserID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	var req updateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	output, err := h.userUseCase.UpdateUserStatus(c.Request.Context(), actorID, targetID, usecase.UpdateUserStatusInput{
		Status: req.Status,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

type assignRoleRequest struct {
	RoleID string `json:"role_id" binding:"required,uuid"`
}

// GetUserRoles handles GET /api/v1/users/:id/roles.
func (h *UserHandler) GetUserRoles(c *gin.Context) {
	userID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	roles, err := h.userUseCase.GetUserRoles(c.Request.Context(), userID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, roles)
}

// AssignRole handles POST /api/v1/users/:id/roles.
func (h *UserHandler) AssignRole(c *gin.Context) {
	userID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	var req assignRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	roleID, err := uuid.Parse(req.RoleID)
	if err != nil {
		respondError(c, apperrors.NewBadRequest("invalid role_id"))
		return
	}

	output, err := h.userUseCase.AssignRole(c.Request.Context(), userID, usecase.AssignRoleInput{
		RoleID: roleID,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 201, output)
}

// RevokeRole handles DELETE /api/v1/users/:id/roles/:role_id.
func (h *UserHandler) RevokeRole(c *gin.Context) {
	userID, err := parseUserIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	roleID, err := parseRoleIDParam(c)
	if err != nil {
		respondError(c, err)
		return
	}

	actorID, err := middleware.GetCurrentUserID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.userUseCase.RevokeRole(c.Request.Context(), actorID, userID, roleID); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

func parseRoleIDParam(c *gin.Context) (uuid.UUID, error) {
	raw := c.Param("role_id")
	if raw == "" {
		return uuid.Nil, apperrors.NewBadRequest("missing role id")
	}

	roleID, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("invalid role id")
	}

	return roleID, nil
}

func parseUserIDParam(c *gin.Context) (uuid.UUID, error) {
	raw := c.Param("id")
	if raw == "" {
		return uuid.Nil, apperrors.NewBadRequest("missing user id")
	}

	userID, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("invalid user id")
	}

	return userID, nil
}
