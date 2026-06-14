//go:build unit

package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/application/usecase"
	"github.com/novacommerce/identity-service/internal/application/usecase/mocks"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type mockAuthUseCase struct {
	mock.Mock
}

func (m *mockAuthUseCase) Register(ctx context.Context, input usecase.RegisterInput) (*usecase.RegisterOutput, error) {
	args := m.Called(ctx, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.RegisterOutput), args.Error(1)
}

func (m *mockAuthUseCase) Login(ctx context.Context, input usecase.LoginInput) (*usecase.LoginOutput, error) {
	args := m.Called(ctx, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.LoginOutput), args.Error(1)
}

func (m *mockAuthUseCase) RefreshToken(ctx context.Context, rawRefreshToken string) (*usecase.LoginOutput, error) {
	args := m.Called(ctx, rawRefreshToken)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.LoginOutput), args.Error(1)
}

func (m *mockAuthUseCase) Logout(ctx context.Context, rawRefreshToken string) error {
	return m.Called(ctx, rawRefreshToken).Error(0)
}

func (m *mockAuthUseCase) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	return m.Called(ctx, userID).Error(0)
}

func (m *mockAuthUseCase) GetMe(ctx context.Context, userID uuid.UUID) (*usecase.UserOutput, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.UserOutput), args.Error(1)
}

func (m *mockAuthUseCase) ChangePassword(ctx context.Context, userID uuid.UUID, input usecase.ChangePasswordInput) error {
	return m.Called(ctx, userID, input).Error(0)
}

func (m *mockAuthUseCase) ForgotPassword(ctx context.Context, email string) error {
	return m.Called(ctx, email).Error(0)
}

func (m *mockAuthUseCase) ResetPassword(ctx context.Context, input usecase.ResetPasswordInput) error {
	return m.Called(ctx, input).Error(0)
}

func setupAuthRouter(authUC usecase.AuthUseCase, jwtSvc port.JWTService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := handler.NewAuthHandler(authUC)

	auth := r.Group("/auth")
	auth.POST("/register", h.Register)
	auth.POST("/login", h.Login)
	auth.POST("/refresh", h.RefreshToken)
	auth.POST("/forgot-password", h.ForgotPassword)
	auth.POST("/reset-password", h.ResetPassword)

	protected := auth.Group("", middleware.JWTAuthMiddleware(jwtSvc))
	protected.GET("/me", h.GetMe)
	protected.PUT("/change-password", h.ChangePassword)
	protected.POST("/logout", h.Logout)

	return r
}

func TestRegisterHandler_Success(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("Register", mock.Anything, mock.AnythingOfType("usecase.RegisterInput")).Return(&usecase.RegisterOutput{
		User: usecase.UserOutput{
			ID:       uuid.New().String(),
			Username: "johndoe",
			Email:    "john@example.com",
			FullName: "John Doe",
			Status:   "active",
		},
	}, nil)

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"username":"johndoe","email":"john@example.com","password":"SecurePass123","full_name":"John Doe"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code)

	var resp map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.NotNil(t, resp["data"])
	assert.Nil(t, resp["error"])
}

func TestRegisterHandler_InvalidBody(t *testing.T) {
	authUC := &mockAuthUseCase{}
	router := setupAuthRouter(authUC, &mocks.JWTService{})

	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBufferString(`{"username":"ab"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestRegisterHandler_DuplicateEmail(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("Register", mock.Anything, mock.AnythingOfType("usecase.RegisterInput")).
		Return(nil, apperrors.NewConflict("email already exists"))

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"username":"johndoe","email":"john@example.com","password":"SecurePass123","full_name":"John Doe"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusConflict, rec.Code)
}

func TestLoginHandler_Success(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("Login", mock.Anything, mock.AnythingOfType("usecase.LoginInput")).Return(&usecase.LoginOutput{
		AccessToken:  "access-token",
		RefreshToken: "refresh-token",
		ExpiresIn:    900,
		User: usecase.UserOutput{
			ID:    uuid.New().String(),
			Email: "john@example.com",
		},
	}, nil)

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"identifier":"john@example.com","password":"SecurePass123"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp struct {
		Data struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
		} `json:"data"`
	}
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, "access-token", resp.Data.AccessToken)
	assert.Equal(t, "refresh-token", resp.Data.RefreshToken)
}

func TestLoginHandler_InvalidCredentials(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("Login", mock.Anything, mock.AnythingOfType("usecase.LoginInput")).
		Return(nil, apperrors.NewUnauthorized("invalid credentials"))

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"identifier":"john@example.com","password":"wrong"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestGetMeHandler_NoToken(t *testing.T) {
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	router := setupAuthRouter(authUC, jwtSvc)

	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestGetMeHandler_InvalidToken(t *testing.T) {
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "bad-token").Return(nil, apperrors.NewUnauthorized("invalid token"))

	router := setupAuthRouter(authUC, jwtSvc)
	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	req.Header.Set("Authorization", "Bearer bad-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestGetMeHandler_Success(t *testing.T) {
	userID := uuid.New()
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}

	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{
		UserID: userID,
		Email:  "john@example.com",
		Roles:  []string{"customer"},
	}, nil)
	authUC.On("GetMe", mock.Anything, userID).Return(&usecase.UserOutput{
		ID:        userID.String(),
		Email:     "john@example.com",
		Username:  "johndoe",
		FullName:  "John Doe",
		Status:    "active",
		CreatedAt: time.Now().UTC(),
	}, nil)

	router := setupAuthRouter(authUC, jwtSvc)
	req := httptest.NewRequest(http.MethodGet, "/auth/me", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp struct {
		Data usecase.UserOutput `json:"data"`
	}
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, "john@example.com", resp.Data.Email)
}

func TestRefreshTokenHandler_Success(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("RefreshToken", mock.Anything, "refresh-token-value-32-characters-min").
		Return(&usecase.LoginOutput{AccessToken: "new-access", RefreshToken: "refresh-token-value-32-characters-min", ExpiresIn: 900}, nil)

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"refresh_token":"refresh-token-value-32-characters-min"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestForgotPasswordHandler_Success(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("ForgotPassword", mock.Anything, "john@example.com").Return(nil)

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"email":"john@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/forgot-password", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestChangePasswordHandler_Success(t *testing.T) {
	userID := uuid.New()
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{UserID: userID}, nil)
	authUC.On("ChangePassword", mock.Anything, userID, mock.AnythingOfType("usecase.ChangePasswordInput")).Return(nil)

	router := setupAuthRouter(authUC, jwtSvc)
	body := `{"current_password":"SecurePass123","new_password":"NewSecure456"}`
	req := httptest.NewRequest(http.MethodPut, "/auth/change-password", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestLogoutHandler_Success(t *testing.T) {
	userID := uuid.New()
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{UserID: userID}, nil)
	authUC.On("Logout", mock.Anything, "refresh-token-value-32-characters-min").Return(nil)

	router := setupAuthRouter(authUC, jwtSvc)
	body := `{"refresh_token":"refresh-token-value-32-characters-min"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/logout", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)
}

func TestResetPasswordHandler_Success(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("ResetPassword", mock.Anything, mock.AnythingOfType("usecase.ResetPasswordInput")).Return(nil)

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"token":"reset-token-with-at-least-32-characters-long","new_password":"NewSecure456"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestRefreshTokenHandler_InvalidBody(t *testing.T) {
	router := setupAuthRouter(&mockAuthUseCase{}, &mocks.JWTService{})
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestChangePasswordHandler_Unauthorized(t *testing.T) {
	userID := uuid.New()
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{UserID: userID}, nil)
	authUC.On("ChangePassword", mock.Anything, userID, mock.AnythingOfType("usecase.ChangePasswordInput")).
		Return(apperrors.NewUnauthorized("invalid credentials"))

	router := setupAuthRouter(authUC, jwtSvc)
	body := `{"current_password":"wrong","new_password":"NewSecure456"}`
	req := httptest.NewRequest(http.MethodPut, "/auth/change-password", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestResetPasswordHandler_Unauthorized(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("ResetPassword", mock.Anything, mock.AnythingOfType("usecase.ResetPasswordInput")).
		Return(apperrors.NewUnauthorized("invalid or expired reset token"))

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"token":"reset-token-with-at-least-32-characters-long","new_password":"NewSecure456"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestForgotPasswordHandler_InvalidBody(t *testing.T) {
	router := setupAuthRouter(&mockAuthUseCase{}, &mocks.JWTService{})
	req := httptest.NewRequest(http.MethodPost, "/auth/forgot-password", bytes.NewBufferString(`{"email":"bad"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestChangePasswordHandler_InvalidBody(t *testing.T) {
	userID := uuid.New()
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{UserID: userID}, nil)

	router := setupAuthRouter(&mockAuthUseCase{}, jwtSvc)
	req := httptest.NewRequest(http.MethodPut, "/auth/change-password", bytes.NewBufferString(`{"current_password":"x"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestRefreshTokenHandler_Unauthorized(t *testing.T) {
	authUC := &mockAuthUseCase{}
	authUC.On("RefreshToken", mock.Anything, "refresh-token-value-32-characters-min").
		Return(nil, apperrors.NewUnauthorized("invalid refresh token"))

	router := setupAuthRouter(authUC, &mocks.JWTService{})
	body := `{"refresh_token":"refresh-token-value-32-characters-min"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestLogoutHandler_Unauthorized(t *testing.T) {
	userID := uuid.New()
	authUC := &mockAuthUseCase{}
	jwtSvc := &mocks.JWTService{}
	jwtSvc.On("ValidateAccessToken", "valid-token").Return(&port.Claims{UserID: userID}, nil)
	authUC.On("Logout", mock.Anything, "refresh-token-value-32-characters-min").
		Return(apperrors.NewUnauthorized("invalid refresh token"))

	router := setupAuthRouter(authUC, jwtSvc)
	body := `{"refresh_token":"refresh-token-value-32-characters-min"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/logout", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestResetPasswordHandler_InvalidBody(t *testing.T) {
	router := setupAuthRouter(&mockAuthUseCase{}, &mocks.JWTService{})
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewBufferString(`{"token":"short"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}
