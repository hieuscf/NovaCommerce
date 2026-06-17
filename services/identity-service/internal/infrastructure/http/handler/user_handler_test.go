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
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type mockUserUseCase struct {
	mock.Mock
}

func (m *mockUserUseCase) GetUser(ctx context.Context, id uuid.UUID) (*usecase.UserProfileOutput, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.UserProfileOutput), args.Error(1)
}

func (m *mockUserUseCase) UpdateProfile(ctx context.Context, id uuid.UUID, input usecase.UpdateProfileInput) (*usecase.UserProfileOutput, error) {
	args := m.Called(ctx, id, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.UserProfileOutput), args.Error(1)
}

type stubJWTService struct{}

func (s *stubJWTService) GenerateAccessToken(userID uuid.UUID, email string, roles []string) (string, error) {
	return "token", nil
}

func (s *stubJWTService) ValidateAccessToken(token string) (*port.Claims, error) {
	switch token {
	case "self-token":
		return &port.Claims{
			UserID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Email:  "self@example.com",
			Roles:  []string{"customer"},
		}, nil
	case "admin-token":
		return &port.Claims{
			UserID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Email:  "admin@example.com",
			Roles:  []string{"admin"},
		}, nil
	case "other-token":
		return &port.Claims{
			UserID: uuid.MustParse("33333333-3333-3333-3333-333333333333"),
			Email:  "other@example.com",
			Roles:  []string{"customer"},
		}, nil
	default:
		return nil, apperrors.NewUnauthorized("invalid token")
	}
}

func setupUserRouter(t *testing.T, uc usecase.UserUseCase) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	r := gin.New()
	h := handler.NewUserHandler(uc)
	jwtSvc := &stubJWTService{}

	v1 := r.Group("/api/v1")
	users := v1.Group("/users", middleware.JWTAuthMiddleware(jwtSvc))
	selfOrAdmin := middleware.RequireSelfOrAdmin("id")
	users.GET("/:id", selfOrAdmin, h.GetUser)
	users.PUT("/:id", selfOrAdmin, h.UpdateProfile)

	return r
}

func TestUserHandler_GetUser_Self(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	now := time.Now().UTC()
	expected := &usecase.UserProfileOutput{
		ID:        userID.String(),
		Username:  "selfuser",
		Email:     "self@example.com",
		FullName:  "Self User",
		Status:    "active",
		CreatedAt: now,
		UpdatedAt: now,
	}
	uc.On("GetUser", mock.Anything, userID).Return(expected, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String(), nil)
	req.Header.Set("Authorization", "Bearer self-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)

	var body map[string]json.RawMessage
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	assert.Equal(t, "null", string(body["error"]))

	var data usecase.UserProfileOutput
	require.NoError(t, json.Unmarshal(body["data"], &data))
	assert.Equal(t, expected.ID, data.ID)
	assert.Equal(t, expected.Email, data.Email)
}

func TestUserHandler_GetUser_AdminAccessOtherUser(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	targetID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	uc.On("GetUser", mock.Anything, targetID).Return(&usecase.UserProfileOutput{ID: targetID.String()}, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+targetID.String(), nil)
	req.Header.Set("Authorization", "Bearer admin-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func TestUserHandler_GetUser_ForbiddenForOtherUser(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	targetID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+targetID.String(), nil)
	req.Header.Set("Authorization", "Bearer other-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusForbidden, rec.Code)
	uc.AssertNotCalled(t, "GetUser", mock.Anything, mock.Anything)
}

func TestUserHandler_UpdateProfile_Self(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	fullName := "Updated Name"
	expected := &usecase.UserProfileOutput{
		ID:       userID.String(),
		FullName: fullName,
	}
	uc.On("UpdateProfile", mock.Anything, userID, usecase.UpdateProfileInput{
		FullName: &fullName,
	}).Return(expected, nil)

	body, err := json.Marshal(map[string]string{"full_name": fullName})
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPut, "/api/v1/users/"+userID.String(), bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer self-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func TestUserHandler_UpdateProfile_InvalidUserID(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	req := httptest.NewRequest(http.MethodPut, "/api/v1/users/not-a-uuid", bytes.NewReader([]byte(`{"full_name":"Test"}`)))
	req.Header.Set("Authorization", "Bearer admin-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestUserHandler_GetUser_Unauthorized(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String(), nil)
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestRequireSelfOrAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	selfID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	otherID := uuid.MustParse("99999999-9999-9999-9999-999999999999")

	tests := []struct {
		name       string
		token      string
		targetPath string
		wantStatus int
	}{
		{name: "self allowed", token: "self-token", targetPath: selfID.String(), wantStatus: http.StatusOK},
		{name: "admin allowed for other", token: "admin-token", targetPath: selfID.String(), wantStatus: http.StatusOK},
		{name: "other user forbidden", token: "other-token", targetPath: selfID.String(), wantStatus: http.StatusForbidden},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := gin.New()
			r.GET("/users/:id",
				middleware.JWTAuthMiddleware(&stubJWTService{}),
				middleware.RequireSelfOrAdmin("id"),
				func(c *gin.Context) { c.Status(http.StatusOK) },
			)

			req := httptest.NewRequest(http.MethodGet, "/users/"+tt.targetPath, nil)
			req.Header.Set("Authorization", "Bearer "+tt.token)
			rec := httptest.NewRecorder()
			r.ServeHTTP(rec, req)

			assert.Equal(t, tt.wantStatus, rec.Code)
		})
	}

	_ = otherID
}
