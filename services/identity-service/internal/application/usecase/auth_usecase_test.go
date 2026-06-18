//go:build unit

package usecase_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/usecase"
	"github.com/novacommerce/identity-service/internal/application/usecase/mocks"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

const testPassword = "SecurePass123"

func defaultRoleRepo() *mocks.RoleRepository {
	customerRoleID := uuid.New()
	roles := &mocks.RoleRepository{}
	roles.On("GetUserRoles", mock.Anything, mock.Anything).Return([]*entity.Role{}, nil).Maybe()
	roles.On("FindByName", mock.Anything, "customer").Return(&entity.Role{
		ID:   customerRoleID,
		Name: "customer",
	}, nil).Maybe()
	roles.On("AssignRole", mock.Anything, mock.Anything, customerRoleID).Return(nil).Maybe()
	return roles
}

func newAuthUseCase(
	userRepo *mocks.UserRepository,
	refreshRepo *mocks.RefreshTokenRepository,
	resetRepo *mocks.PasswordResetTokenRepository,
	jwtSvc *mocks.JWTService,
	emailSvc *mocks.EmailService,
	kafka *mocks.KafkaProducer,
	limiter *mocks.RateLimiter,
) usecase.AuthUseCase {
	return usecase.NewAuthUseCase(
		userRepo,
		defaultRoleRepo(),
		refreshRepo,
		resetRepo,
		jwtSvc,
		emailSvc,
		kafka,
		limiter,
	)
}

func createActiveUser() *entity.User {
	user := &entity.User{
		ID:        uuid.New(),
		Username:  "johndoe",
		Email:     "john@example.com",
		FullName:  "John Doe",
		Status:    entity.UserStatusActive,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	_ = user.SetPassword(testPassword)
	return user
}

func TestRegister_Success(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}
	reset := &mocks.PasswordResetTokenRepository{}
	jwtSvc := &mocks.JWTService{}
	emailSvc := &mocks.EmailService{}
	kafka := &mocks.KafkaProducer{}
	limiter := &mocks.RateLimiter{}

	users.On("FindByEmail", ctx, "john@example.com").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("FindByUsername", ctx, "johndoe").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("Create", ctx, mock.AnythingOfType("*entity.User")).Return(nil)
	kafka.On("Publish", ctx, "user-events", mock.AnythingOfType("string"), mock.Anything).Return(nil)

	uc := newAuthUseCase(users, refresh, reset, jwtSvc, emailSvc, kafka, limiter)
	out, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.NoError(t, err)
	require.NotNil(t, out)
	assert.Equal(t, "john@example.com", out.User.Email)
	kafka.AssertCalled(t, "Publish", ctx, "user-events", mock.AnythingOfType("string"), mock.Anything)
}

func TestRegister_AssignsCustomerRole(t *testing.T) {
	ctx := context.Background()
	customerRoleID := uuid.New()
	users := &mocks.UserRepository{}
	roles := &mocks.RoleRepository{}
	kafka := &mocks.KafkaProducer{}

	users.On("FindByEmail", ctx, "john@example.com").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("FindByUsername", ctx, "johndoe").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("Create", ctx, mock.AnythingOfType("*entity.User")).Return(nil)
	roles.On("FindByName", ctx, "customer").Return(&entity.Role{
		ID:   customerRoleID,
		Name: "customer",
	}, nil)
	roles.On("AssignRole", ctx, mock.Anything, customerRoleID).Return(nil)
	kafka.On("Publish", ctx, "user-events", mock.AnythingOfType("string"), mock.Anything).Return(nil)

	uc := usecase.NewAuthUseCase(
		users,
		roles,
		&mocks.RefreshTokenRepository{},
		&mocks.PasswordResetTokenRepository{},
		&mocks.JWTService{},
		&mocks.EmailService{},
		kafka,
		&mocks.RateLimiter{},
	)
	_, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.NoError(t, err)
	roles.AssertExpectations(t)
}

func TestRegister_DuplicateEmail(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	users.On("FindByEmail", ctx, "john@example.com").Return(createActiveUser(), nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeConflict, appErr.Code)
}

func TestRegister_DuplicateUsername(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	users.On("FindByEmail", ctx, "john@example.com").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("FindByUsername", ctx, "johndoe").Return(createActiveUser(), nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeConflict, appErr.Code)
}

func TestRegister_WeakPassword(t *testing.T) {
	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Register(context.Background(), usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: "password",
		FullName: "John Doe",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestLogin_Success_WithEmail(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}
	jwtSvc := &mocks.JWTService{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:john@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "john@example.com").Return(user, nil)
	users.On("UpdateLastLogin", ctx, user.ID).Return(nil)
	jwtSvc.On("GenerateAccessToken", user.ID, user.Email, mock.Anything).Return("access-token", nil)
	refresh.On("Create", ctx, mock.AnythingOfType("*entity.RefreshToken")).Return(nil)

	uc := newAuthUseCase(users, refresh, &mocks.PasswordResetTokenRepository{}, jwtSvc, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	out, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "john@example.com",
		Password:   testPassword,
	})

	require.NoError(t, err)
	assert.Equal(t, "access-token", out.AccessToken)
	assert.NotEmpty(t, out.RefreshToken)
}

func TestLogin_IncludesRolesInJWT(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}
	jwtSvc := &mocks.JWTService{}
	limiter := &mocks.RateLimiter{}
	roles := &mocks.RoleRepository{}

	limiter.On("Allow", ctx, "login:john@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "john@example.com").Return(user, nil)
	users.On("UpdateLastLogin", ctx, user.ID).Return(nil)
	roles.On("GetUserRoles", ctx, user.ID).Return([]*entity.Role{
		{Name: "admin"},
		{Name: "customer"},
	}, nil)
	jwtSvc.On("GenerateAccessToken", user.ID, user.Email, []string{"admin", "customer"}).Return("access-token", nil)
	refresh.On("Create", ctx, mock.AnythingOfType("*entity.RefreshToken")).Return(nil)

	uc := usecase.NewAuthUseCase(
		users,
		roles,
		refresh,
		&mocks.PasswordResetTokenRepository{},
		jwtSvc,
		&mocks.EmailService{},
		&mocks.KafkaProducer{},
		limiter,
	)
	out, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "john@example.com",
		Password:   testPassword,
	})

	require.NoError(t, err)
	assert.Equal(t, "access-token", out.AccessToken)
	roles.AssertExpectations(t)
	jwtSvc.AssertExpectations(t)
}

func TestLogin_Success_WithUsername(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}
	jwtSvc := &mocks.JWTService{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:johndoe").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "johndoe").Return(user, nil)
	users.On("UpdateLastLogin", ctx, user.ID).Return(nil)
	jwtSvc.On("GenerateAccessToken", user.ID, user.Email, mock.Anything).Return("access-token", nil)
	refresh.On("Create", ctx, mock.AnythingOfType("*entity.RefreshToken")).Return(nil)

	uc := newAuthUseCase(users, refresh, &mocks.PasswordResetTokenRepository{}, jwtSvc, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	out, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "johndoe",
		Password:   testPassword,
	})

	require.NoError(t, err)
	assert.Equal(t, "access-token", out.AccessToken)
}

func TestLogin_WrongPassword(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:john@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "john@example.com").Return(user, nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	_, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "john@example.com",
		Password:   "WrongPass123",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
	assert.Equal(t, "invalid credentials", appErr.Message)
}

func TestLogin_UserNotFound(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:missing@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "missing@example.com").Return(nil, apperrors.NewNotFound("user not found"))

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	_, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "missing@example.com",
		Password:   testPassword,
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
	assert.Equal(t, "invalid credentials", appErr.Message)
}

func TestLogin_InactiveUser(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	user.Status = entity.UserStatusInactive
	users := &mocks.UserRepository{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:john@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "john@example.com").Return(user, nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	_, err := uc.Login(ctx, usecase.LoginInput{
		Identifier: "john@example.com",
		Password:   testPassword,
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestRefreshToken_Success(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	rawToken := "valid-refresh-token-with-32-characters-min"
	refresh := &mocks.RefreshTokenRepository{}
	users := &mocks.UserRepository{}
	jwtSvc := &mocks.JWTService{}

	stored := &entity.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: "hash",
		ExpiresAt: time.Now().Add(time.Hour),
		CreatedAt: time.Now(),
	}

	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)
	users.On("FindByID", ctx, user.ID).Return(user, nil)
	jwtSvc.On("GenerateAccessToken", user.ID, user.Email, mock.Anything).Return("new-access-token", nil)

	uc := newAuthUseCase(users, refresh, &mocks.PasswordResetTokenRepository{}, jwtSvc, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	out, err := uc.RefreshToken(ctx, rawToken)

	require.NoError(t, err)
	assert.Equal(t, "new-access-token", out.AccessToken)
	assert.Equal(t, rawToken, out.RefreshToken)
}

func TestRefreshToken_Expired(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	stored := &entity.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(-time.Hour),
		CreatedAt: time.Now().Add(-2 * time.Hour),
	}

	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.RefreshToken(ctx, "expired-refresh-token-32-characters-min")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestRefreshToken_Revoked(t *testing.T) {
	ctx := context.Background()
	revokedAt := time.Now()
	stored := &entity.RefreshToken{
		ID:        uuid.New(),
		UserID:    uuid.New(),
		ExpiresAt: time.Now().Add(time.Hour),
		RevokedAt: &revokedAt,
		CreatedAt: time.Now(),
	}

	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.RefreshToken(ctx, "revoked-refresh-token-32-characters-min")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestRefreshToken_NotFound(t *testing.T) {
	ctx := context.Background()
	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(nil, apperrors.NewNotFound("refresh token not found"))

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.RefreshToken(ctx, "missing-refresh-token-32-characters-min")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestChangePassword_Success(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}

	users.On("FindByID", ctx, user.ID).Return(user, nil)
	users.On("UpdatePassword", ctx, user.ID, mock.AnythingOfType("string")).Return(nil)
	refresh.On("RevokeAllByUserID", ctx, user.ID).Return(nil)

	uc := newAuthUseCase(users, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ChangePassword(ctx, user.ID, usecase.ChangePasswordInput{
		CurrentPassword: testPassword,
		NewPassword:     "NewSecure456",
	})

	require.NoError(t, err)
	refresh.AssertCalled(t, "RevokeAllByUserID", ctx, user.ID)
}

func TestChangePassword_WrongCurrentPassword(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	users.On("FindByID", ctx, user.ID).Return(user, nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ChangePassword(ctx, user.ID, usecase.ChangePasswordInput{
		CurrentPassword: "WrongPass123",
		NewPassword:     "NewSecure456",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestChangePassword_SamePassword(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	users.On("FindByID", ctx, user.ID).Return(user, nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ChangePassword(ctx, user.ID, usecase.ChangePasswordInput{
		CurrentPassword: testPassword,
		NewPassword:     testPassword,
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestForgotPassword_ExistingEmail(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	reset := &mocks.PasswordResetTokenRepository{}
	emailSvc := &mocks.EmailService{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "forgot:"+user.Email).Return(nil)
	users.On("FindByEmail", ctx, user.Email).Return(user, nil)
	reset.On("DeleteExpiredByUserID", ctx, user.ID).Return(nil)
	reset.On("Create", ctx, mock.AnythingOfType("*entity.PasswordResetToken")).Return(nil)
	emailSvc.On("SendPasswordReset", user.Email, mock.AnythingOfType("string")).Return(nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, reset, &mocks.JWTService{}, emailSvc, &mocks.KafkaProducer{}, limiter)
	err := uc.ForgotPassword(ctx, user.Email)

	require.NoError(t, err)
	emailSvc.AssertCalled(t, "SendPasswordReset", user.Email, mock.AnythingOfType("string"))
	reset.AssertCalled(t, "Create", ctx, mock.AnythingOfType("*entity.PasswordResetToken"))
}

func TestForgotPassword_NonExistingEmail(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "forgot:missing@example.com").Return(nil)
	users.On("FindByEmail", ctx, "missing@example.com").Return(nil, apperrors.NewNotFound("user not found"))

	emailSvc := &mocks.EmailService{}
	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, emailSvc, &mocks.KafkaProducer{}, limiter)
	err := uc.ForgotPassword(ctx, "missing@example.com")

	require.NoError(t, err)
	emailSvc.AssertNotCalled(t, "SendPasswordReset", mock.Anything, mock.Anything)
}

func TestResetPassword_Success(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	rawToken := "reset-token-with-at-least-32-characters-long"
	reset := &mocks.PasswordResetTokenRepository{}
	users := &mocks.UserRepository{}
	refresh := &mocks.RefreshTokenRepository{}

	stored := &entity.PasswordResetToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: "hash",
		ExpiresAt: time.Now().Add(time.Hour),
		CreatedAt: time.Now(),
	}

	reset.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)
	users.On("FindByID", ctx, user.ID).Return(user, nil)
	users.On("UpdatePassword", ctx, user.ID, mock.AnythingOfType("string")).Return(nil)
	reset.On("MarkUsed", ctx, stored.ID).Return(nil)
	refresh.On("RevokeAllByUserID", ctx, user.ID).Return(nil)

	uc := newAuthUseCase(users, refresh, reset, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ResetPassword(ctx, usecase.ResetPasswordInput{
		Token:       rawToken,
		NewPassword: "NewSecure456",
	})

	require.NoError(t, err)
	reset.AssertCalled(t, "MarkUsed", ctx, stored.ID)
	refresh.AssertCalled(t, "RevokeAllByUserID", ctx, user.ID)
}

func TestResetPassword_ExpiredToken(t *testing.T) {
	ctx := context.Background()
	stored := &entity.PasswordResetToken{
		ID:        uuid.New(),
		UserID:    uuid.New(),
		ExpiresAt: time.Now().Add(-time.Hour),
		CreatedAt: time.Now().Add(-2 * time.Hour),
	}

	reset := &mocks.PasswordResetTokenRepository{}
	reset.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, reset, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ResetPassword(ctx, usecase.ResetPasswordInput{
		Token:       "expired-reset-token-with-32-characters-min",
		NewPassword: "NewSecure456",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestResetPassword_AlreadyUsed(t *testing.T) {
	ctx := context.Background()
	usedAt := time.Now()
	stored := &entity.PasswordResetToken{
		ID:        uuid.New(),
		UserID:    uuid.New(),
		ExpiresAt: time.Now().Add(time.Hour),
		UsedAt:    &usedAt,
		CreatedAt: time.Now(),
	}

	reset := &mocks.PasswordResetTokenRepository{}
	reset.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, reset, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ResetPassword(ctx, usecase.ResetPasswordInput{
		Token:       "used-reset-token-with-32-characters-minimum",
		NewPassword: "NewSecure456",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestLogout_Success(t *testing.T) {
	ctx := context.Background()
	tokenID := uuid.New()
	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(&entity.RefreshToken{ID: tokenID}, nil)
	refresh.On("RevokeByID", ctx, tokenID).Return(nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.Logout(ctx, "logout-refresh-token-32-characters-min")

	require.NoError(t, err)
}

func TestLogoutAll_Success(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("RevokeAllByUserID", ctx, userID).Return(nil)

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.LogoutAll(ctx, userID)

	require.NoError(t, err)
}

func TestGetMe_Success(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	users.On("FindByID", ctx, user.ID).Return(user, nil)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	out, err := uc.GetMe(ctx, user.ID)

	require.NoError(t, err)
	assert.Equal(t, user.Email, out.Email)
}

func TestLogin_ValidationError(t *testing.T) {
	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Login(context.Background(), usecase.LoginInput{Identifier: "ab", Password: ""})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestLogin_RateLimited(t *testing.T) {
	ctx := context.Background()
	limiter := &mocks.RateLimiter{}
	limiter.On("Allow", ctx, "login:john@example.com").Return(apperrors.NewTooManyRequests("too many requests"))

	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	_, err := uc.Login(ctx, usecase.LoginInput{Identifier: "john@example.com", Password: testPassword})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeTooManyRequests, appErr.Code)
}

func TestRefreshToken_InactiveUser(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	user.Status = entity.UserStatusBanned
	stored := &entity.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(time.Hour),
		CreatedAt: time.Now(),
	}

	refresh := &mocks.RefreshTokenRepository{}
	users := &mocks.UserRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(stored, nil)
	users.On("FindByID", ctx, user.ID).Return(user, nil)

	uc := newAuthUseCase(users, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.RefreshToken(ctx, "inactive-user-refresh-token-32-chars-min")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestLogout_InvalidToken(t *testing.T) {
	ctx := context.Background()
	refresh := &mocks.RefreshTokenRepository{}
	refresh.On("FindByTokenHash", ctx, mock.AnythingOfType("string")).Return(nil, apperrors.NewNotFound("refresh token not found"))

	uc := newAuthUseCase(&mocks.UserRepository{}, refresh, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.Logout(ctx, "missing-refresh-token-32-characters-min")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeUnauthorized, appErr.Code)
}

func TestResetPassword_WeakPassword(t *testing.T) {
	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ResetPassword(context.Background(), usecase.ResetPasswordInput{
		Token:       "reset-token-with-at-least-32-characters-long",
		NewPassword: "weak",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestRegister_InvalidUsername(t *testing.T) {
	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Register(context.Background(), usecase.RegisterInput{
		Username: "john_doe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestRegister_KafkaPublishError(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	kafka := &mocks.KafkaProducer{}

	users.On("FindByEmail", ctx, "john@example.com").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("FindByUsername", ctx, "johndoe").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("Create", ctx, mock.AnythingOfType("*entity.User")).Return(nil)
	kafka.On("Publish", ctx, "user-events", mock.AnythingOfType("string"), mock.Anything).Return(assert.AnError)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, kafka, &mocks.RateLimiter{})
	_, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.Error(t, err)
}

func TestGetMe_NotFound(t *testing.T) {
	ctx := context.Background()
	userID := uuid.New()
	users := &mocks.UserRepository{}
	users.On("FindByID", ctx, userID).Return(nil, apperrors.NewNotFound("user not found"))

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.GetMe(ctx, userID)

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeNotFound, appErr.Code)
}

func TestForgotPassword_InvalidEmail(t *testing.T) {
	uc := newAuthUseCase(&mocks.UserRepository{}, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	err := uc.ForgotPassword(context.Background(), "not-an-email")

	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestRegister_CreateError(t *testing.T) {
	ctx := context.Background()
	users := &mocks.UserRepository{}
	users.On("FindByEmail", ctx, "john@example.com").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("FindByUsername", ctx, "johndoe").Return(nil, apperrors.NewNotFound("user not found"))
	users.On("Create", ctx, mock.AnythingOfType("*entity.User")).Return(assert.AnError)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, &mocks.JWTService{}, &mocks.EmailService{}, &mocks.KafkaProducer{}, &mocks.RateLimiter{})
	_, err := uc.Register(ctx, usecase.RegisterInput{
		Username: "johndoe",
		Email:    "john@example.com",
		Password: testPassword,
		FullName: "John Doe",
	})

	require.Error(t, err)
}

func TestLogin_JWTError(t *testing.T) {
	ctx := context.Background()
	user := createActiveUser()
	users := &mocks.UserRepository{}
	jwtSvc := &mocks.JWTService{}
	limiter := &mocks.RateLimiter{}

	limiter.On("Allow", ctx, "login:john@example.com").Return(nil)
	users.On("FindByEmailOrUsername", ctx, "john@example.com").Return(user, nil)
	users.On("UpdateLastLogin", ctx, user.ID).Return(nil)
	jwtSvc.On("GenerateAccessToken", user.ID, user.Email, mock.Anything).Return("", assert.AnError)

	uc := newAuthUseCase(users, &mocks.RefreshTokenRepository{}, &mocks.PasswordResetTokenRepository{}, jwtSvc, &mocks.EmailService{}, &mocks.KafkaProducer{}, limiter)
	_, err := uc.Login(ctx, usecase.LoginInput{Identifier: "john@example.com", Password: testPassword})

	require.Error(t, err)
}
