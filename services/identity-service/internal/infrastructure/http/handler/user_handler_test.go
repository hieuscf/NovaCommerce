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

func (m *mockUserUseCase) ListUsers(ctx context.Context, input usecase.ListUsersInput) (*usecase.ListUsersResult, error) {
	args := m.Called(ctx, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.ListUsersResult), args.Error(1)
}

func (m *mockUserUseCase) UpdateUserStatus(ctx context.Context, actorID, targetID uuid.UUID, input usecase.UpdateUserStatusInput) (*usecase.UserProfileOutput, error) {
	args := m.Called(ctx, actorID, targetID, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.UserProfileOutput), args.Error(1)
}

func (m *mockUserUseCase) GetUserRoles(ctx context.Context, userID uuid.UUID) ([]usecase.RoleOutput, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]usecase.RoleOutput), args.Error(1)
}

func (m *mockUserUseCase) AssignRole(ctx context.Context, userID uuid.UUID, input usecase.AssignRoleInput) (*usecase.RoleOutput, error) {
	args := m.Called(ctx, userID, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*usecase.RoleOutput), args.Error(1)
}

func (m *mockUserUseCase) RevokeRole(ctx context.Context, actorID, userID, roleID uuid.UUID) error {
	return m.Called(ctx, actorID, userID, roleID).Error(0)
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
	adminOnly := middleware.RequireRole("admin")
	users.GET("", adminOnly, h.ListUsers)
	selfOrAdmin := middleware.RequireSelfOrAdmin("id")
	users.GET("/:id/roles", adminOnly, h.GetUserRoles)
	users.POST("/:id/roles", adminOnly, h.AssignRole)
	users.DELETE("/:id/roles/:role_id", adminOnly, h.RevokeRole)
	users.GET("/:id", selfOrAdmin, h.GetUser)
	users.PUT("/:id", selfOrAdmin, h.UpdateProfile)
	users.PUT("/:id/status", adminOnly, h.UpdateUserStatus)

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

func TestUserHandler_ListUsers_Admin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	uc.On("ListUsers", mock.Anything, usecase.ListUsersInput{
		Status: "active",
		Limit:  20,
	}).Return(&usecase.ListUsersResult{
		Users: []usecase.UserProfileOutput{
			{ID: "11111111-1111-1111-1111-111111111111", Email: "user@example.com"},
		},
		HasMore: false,
	}, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users?status=active", nil)
	req.Header.Set("Authorization", "Bearer admin-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)

	var body struct {
		Data []usecase.UserProfileOutput `json:"data"`
		Meta struct {
			NextCursor string `json:"next_cursor"`
			HasMore    bool   `json:"has_more"`
		} `json:"meta"`
		Error any `json:"error"`
	}
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	require.Len(t, body.Data, 1)
	assert.False(t, body.Meta.HasMore)
	assert.Nil(t, body.Error)
}

func TestUserHandler_ListUsers_ForbiddenForNonAdmin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	req.Header.Set("Authorization", "Bearer self-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusForbidden, rec.Code)
	uc.AssertNotCalled(t, "ListUsers", mock.Anything, mock.Anything)
}

func TestUserHandler_UpdateUserStatus_Admin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	adminID := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	targetID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	uc.On("UpdateUserStatus", mock.Anything, adminID, targetID, usecase.UpdateUserStatusInput{
		Status: "disabled",
	}).Return(&usecase.UserProfileOutput{
		ID:     targetID.String(),
		Status: "inactive",
	}, nil)

	body := []byte(`{"status":"disabled"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/users/"+targetID.String()+"/status", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer admin-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func TestUserHandler_UpdateUserStatus_SelfDisableValidation(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	adminID := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	uc.On("UpdateUserStatus", mock.Anything, adminID, adminID, usecase.UpdateUserStatusInput{
		Status: "disabled",
	}).Return(nil, apperrors.NewValidation("admin cannot disable their own account", nil))

	body := []byte(`{"status":"disabled"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/users/"+adminID.String()+"/status", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer admin-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusBadRequest, rec.Code)

	var resp struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, apperrors.ErrCodeValidation, resp.Error.Code)
}

func TestUserHandler_UpdateUserStatus_ForbiddenForNonAdmin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	targetID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	body := []byte(`{"status":"active"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/v1/users/"+targetID.String()+"/status", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer self-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusForbidden, rec.Code)
	uc.AssertNotCalled(t, "UpdateUserStatus", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestUserHandler_GetUserRoles_Admin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	roleID := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	uc.On("GetUserRoles", mock.Anything, userID).Return([]usecase.RoleOutput{
		{ID: roleID.String(), Name: "customer", DisplayName: "Customer"},
	}, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String()+"/roles", nil)
	req.Header.Set("Authorization", "Bearer admin-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
}

func TestUserHandler_AssignRole_Admin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	roleID := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	uc.On("AssignRole", mock.Anything, userID, usecase.AssignRoleInput{RoleID: roleID}).
		Return(&usecase.RoleOutput{ID: roleID.String(), Name: "seller"}, nil)

	body := []byte(`{"role_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/users/"+userID.String()+"/roles", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer admin-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusCreated, rec.Code)
}

func TestUserHandler_AssignRole_Conflict(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	roleID := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	uc.On("AssignRole", mock.Anything, userID, usecase.AssignRoleInput{RoleID: roleID}).
		Return(nil, apperrors.NewConflict("role already assigned to user"))

	body := []byte(`{"role_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/users/"+userID.String()+"/roles", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer admin-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusConflict, rec.Code)
}

func TestUserHandler_RevokeRole_Admin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	adminID := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	roleID := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	uc.On("RevokeRole", mock.Anything, adminID, userID, roleID).Return(nil)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/users/"+userID.String()+"/roles/"+roleID.String(), nil)
	req.Header.Set("Authorization", "Bearer admin-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusNoContent, rec.Code)
}

func TestUserHandler_GetUserRoles_ForbiddenForNonAdmin(t *testing.T) {
	uc := &mockUserUseCase{}
	engine := setupUserRouter(t, uc)

	userID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String()+"/roles", nil)
	req.Header.Set("Authorization", "Bearer self-token")
	rec := httptest.NewRecorder()
	engine.ServeHTTP(rec, req)

	require.Equal(t, http.StatusForbidden, rec.Code)
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
