package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/novacommerce/identity-service/internal/application/usecase"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
)

// AuthHandler serves authentication HTTP endpoints.
type AuthHandler struct {
	authUseCase usecase.AuthUseCase
}

// NewAuthHandler creates an AuthHandler.
func NewAuthHandler(authUseCase usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase}
}

type registerRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=72"`
	FullName string `json:"full_name" binding:"required"`
}

type loginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type refreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type logoutRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=72"`
}

type forgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type resetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8,max=72"`
}

// Register handles POST /auth/register.
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	output, err := h.authUseCase.Register(c.Request.Context(), usecase.RegisterInput{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 201, output)
}

// Login handles POST /auth/login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	output, err := h.authUseCase.Login(c.Request.Context(), usecase.LoginInput{
		Identifier: req.Identifier,
		Password:   req.Password,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

// RefreshToken handles POST /auth/refresh.
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req refreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	output, err := h.authUseCase.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

// Logout handles POST /auth/logout.
func (h *AuthHandler) Logout(c *gin.Context) {
	var req logoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	if err := h.authUseCase.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

// LogoutAll handles POST /auth/logout-all.
func (h *AuthHandler) LogoutAll(c *gin.Context) {
	userID, err := middleware.GetCurrentUserID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.authUseCase.LogoutAll(c.Request.Context(), userID); err != nil {
		respondError(c, err)
		return
	}

	respondNoContent(c)
}

// GetMe handles GET /auth/me.
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, err := middleware.GetCurrentUserID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	output, err := h.authUseCase.GetMe(c.Request.Context(), userID)
	if err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, output)
}

// ChangePassword handles PUT /auth/change-password.
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	userID, err := middleware.GetCurrentUserID(c)
	if err != nil {
		respondError(c, err)
		return
	}

	if err := h.authUseCase.ChangePassword(c.Request.Context(), userID, usecase.ChangePasswordInput{
		CurrentPassword: req.CurrentPassword,
		NewPassword:     req.NewPassword,
	}); err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, map[string]string{"message": "password changed successfully"})
}

// ForgotPassword handles POST /auth/forgot-password.
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	_ = h.authUseCase.ForgotPassword(c.Request.Context(), req.Email)

	respondSuccess(c, 200, map[string]string{
		"message": "if the email exists, a password reset link has been sent",
	})
}

// ResetPassword handles POST /auth/reset-password.
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req resetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	if err := h.authUseCase.ResetPassword(c.Request.Context(), usecase.ResetPasswordInput{
		Token:       req.Token,
		NewPassword: req.NewPassword,
	}); err != nil {
		respondError(c, err)
		return
	}

	respondSuccess(c, 200, map[string]string{"message": "password reset successfully"})
}
