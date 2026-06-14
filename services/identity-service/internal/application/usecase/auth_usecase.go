package usecase

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/mail"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

const (
	topicUserEvents      = "user-events"
	eventUserRegistered  = "USER_REGISTERED"
	accessTokenExpiresIn = int64(15 * 60) // 15 minutes in seconds
	refreshTokenTTL      = 7 * 24 * time.Hour
	minPasswordLength    = 8
)

var usernamePattern = regexp.MustCompile(`^[a-zA-Z0-9]{3,30}$`)

// AuthUseCase defines authentication and account lifecycle operations.
type AuthUseCase interface {
	Register(ctx context.Context, input RegisterInput) (*RegisterOutput, error)
	Login(ctx context.Context, input LoginInput) (*LoginOutput, error)
	RefreshToken(ctx context.Context, rawRefreshToken string) (*LoginOutput, error)
	Logout(ctx context.Context, rawRefreshToken string) error
	LogoutAll(ctx context.Context, userID uuid.UUID) error
	GetMe(ctx context.Context, userID uuid.UUID) (*UserOutput, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, input ChangePasswordInput) error
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, input ResetPasswordInput) error
}

type authUseCase struct {
	userRepo          repository.UserRepository
	refreshTokenRepo  repository.RefreshTokenRepository
	passwordResetRepo repository.PasswordResetTokenRepository
	jwtService        port.JWTService
	emailService      port.EmailService
	kafkaProducer     port.KafkaProducer
	rateLimiter       port.RateLimiter
}

// NewAuthUseCase creates an AuthUseCase with the given dependencies.
func NewAuthUseCase(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	passwordResetRepo repository.PasswordResetTokenRepository,
	jwtService port.JWTService,
	emailService port.EmailService,
	kafkaProducer port.KafkaProducer,
	rateLimiter port.RateLimiter,
) AuthUseCase {
	return &authUseCase{
		userRepo:          userRepo,
		refreshTokenRepo:  refreshTokenRepo,
		passwordResetRepo: passwordResetRepo,
		jwtService:        jwtService,
		emailService:      emailService,
		kafkaProducer:     kafkaProducer,
		rateLimiter:       rateLimiter,
	}
}

type userRegisteredEvent struct {
	Type      string    `json:"type"`
	UserID    uuid.UUID `json:"userID"`
	Email     string    `json:"email"`
	Timestamp time.Time `json:"timestamp"`
}

func (uc *authUseCase) Register(ctx context.Context, input RegisterInput) (*RegisterOutput, error) {
	if err := validateRegisterInput(input); err != nil {
		return nil, err
	}

	if err := uc.ensureEmailAvailable(ctx, input.Email); err != nil {
		return nil, err
	}
	if err := uc.ensureUsernameAvailable(ctx, input.Username); err != nil {
		return nil, err
	}

	user := &entity.User{
		ID:        uuid.New(),
		Username:  input.Username,
		Email:     input.Email,
		FullName:  input.FullName,
		Status:    entity.UserStatusActive,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	if err := user.SetPassword(input.Password); err != nil {
		return nil, fmt.Errorf("authUseCase.Register: %w", err)
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, wrapAuthError("Register", err)
	}

	event := userRegisteredEvent{
		Type:      eventUserRegistered,
		UserID:    user.ID,
		Email:     user.Email,
		Timestamp: time.Now().UTC(),
	}
	if err := uc.kafkaProducer.Publish(ctx, topicUserEvents, user.ID.String(), event); err != nil {
		return nil, fmt.Errorf("authUseCase.Register: %w", err)
	}

	return &RegisterOutput{User: mapUserToOutput(user)}, nil
}

func (uc *authUseCase) Login(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	if err := uc.rateLimit(ctx, "login:"+input.Identifier); err != nil {
		return nil, err
	}

	user, err := uc.userRepo.FindByEmailOrUsername(ctx, input.Identifier)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.NewUnauthorized("invalid credentials")
		}
		return nil, wrapAuthError("Login", err)
	}

	if !user.CheckPassword(input.Password) {
		return nil, apperrors.NewUnauthorized("invalid credentials")
	}
	if !user.IsActive() {
		return nil, apperrors.NewUnauthorized("account is disabled")
	}

	if err := uc.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		return nil, wrapAuthError("Login", err)
	}

	return uc.issueLoginTokens(ctx, user, input.IPAddress, input.UserAgent, "")
}

func (uc *authUseCase) RefreshToken(ctx context.Context, rawRefreshToken string) (*LoginOutput, error) {
	_, user, err := uc.findValidRefreshToken(ctx, rawRefreshToken)
	if err != nil {
		return nil, err
	}

	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email, nil)
	if err != nil {
		return nil, fmt.Errorf("authUseCase.RefreshToken: %w", err)
	}

	return &LoginOutput{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		ExpiresIn:    accessTokenExpiresIn,
		User:         mapUserToOutput(user),
	}, nil
}

func (uc *authUseCase) Logout(ctx context.Context, rawRefreshToken string) error {
	tokenHash := hashToken(rawRefreshToken)

	stored, err := uc.refreshTokenRepo.FindByTokenHash(ctx, tokenHash)
	if err != nil {
		if isNotFound(err) {
			return apperrors.NewUnauthorized("invalid refresh token")
		}
		return wrapAuthError("Logout", err)
	}

	if err := uc.refreshTokenRepo.RevokeByID(ctx, stored.ID); err != nil {
		return wrapAuthError("Logout", err)
	}

	return nil
}

func (uc *authUseCase) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	if err := uc.refreshTokenRepo.RevokeAllByUserID(ctx, userID); err != nil {
		return wrapAuthError("LogoutAll", err)
	}
	return nil
}

func (uc *authUseCase) GetMe(ctx context.Context, userID uuid.UUID) (*UserOutput, error) {
	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, wrapAuthError("GetMe", err)
	}

	output := mapUserToOutput(user)
	return &output, nil
}

func (uc *authUseCase) ChangePassword(ctx context.Context, userID uuid.UUID, input ChangePasswordInput) error {
	if len(input.NewPassword) < minPasswordLength {
		return apperrors.NewValidation("new password must be at least 8 characters", nil)
	}

	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return wrapAuthError("ChangePassword", err)
	}

	if !user.CheckPassword(input.CurrentPassword) {
		return apperrors.NewUnauthorized("invalid credentials")
	}

	if err := user.SetPassword(input.NewPassword); err != nil {
		return fmt.Errorf("authUseCase.ChangePassword: %w", err)
	}

	if err := uc.userRepo.UpdatePassword(ctx, userID, user.PasswordHash); err != nil {
		return wrapAuthError("ChangePassword", err)
	}

	if err := uc.refreshTokenRepo.RevokeAllByUserID(ctx, userID); err != nil {
		return wrapAuthError("ChangePassword", err)
	}

	return nil
}

func (uc *authUseCase) ForgotPassword(ctx context.Context, email string) error {
	if err := validateEmail(email); err != nil {
		return err
	}
	if err := uc.rateLimit(ctx, "forgot:"+email); err != nil {
		return err
	}

	user, err := uc.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if isNotFound(err) {
			return nil
		}
		return wrapAuthError("ForgotPassword", err)
	}

	rawToken, err := generateRawToken()
	if err != nil {
		return fmt.Errorf("authUseCase.ForgotPassword: %w", err)
	}

	if err := uc.passwordResetRepo.DeleteExpiredByUserID(ctx, user.ID); err != nil {
		return wrapAuthError("ForgotPassword", err)
	}

	now := time.Now().UTC()
	resetToken := &entity.PasswordResetToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: hashToken(rawToken),
		ExpiresAt: now.Add(entity.PasswordResetTokenTTL),
		CreatedAt: now,
	}
	if err := uc.passwordResetRepo.Create(ctx, resetToken); err != nil {
		return wrapAuthError("ForgotPassword", err)
	}

	if err := uc.emailService.SendPasswordReset(user.Email, rawToken); err != nil {
		return fmt.Errorf("authUseCase.ForgotPassword: %w", err)
	}

	return nil
}

func (uc *authUseCase) ResetPassword(ctx context.Context, input ResetPasswordInput) error {
	if len(input.NewPassword) < minPasswordLength {
		return apperrors.NewValidation("new password must be at least 8 characters", nil)
	}

	tokenHash := hashToken(input.Token)
	stored, err := uc.passwordResetRepo.FindByTokenHash(ctx, tokenHash)
	if err != nil {
		if isNotFound(err) {
			return apperrors.NewUnauthorized("invalid or expired reset token")
		}
		return wrapAuthError("ResetPassword", err)
	}
	if !stored.IsValid() {
		return apperrors.NewUnauthorized("invalid or expired reset token")
	}

	user, err := uc.userRepo.FindByID(ctx, stored.UserID)
	if err != nil {
		return wrapAuthError("ResetPassword", err)
	}

	if err := user.SetPassword(input.NewPassword); err != nil {
		return fmt.Errorf("authUseCase.ResetPassword: %w", err)
	}

	if err := uc.userRepo.UpdatePassword(ctx, user.ID, user.PasswordHash); err != nil {
		return wrapAuthError("ResetPassword", err)
	}

	if err := uc.passwordResetRepo.MarkUsed(ctx, stored.ID); err != nil {
		return wrapAuthError("ResetPassword", err)
	}

	if err := uc.refreshTokenRepo.RevokeAllByUserID(ctx, user.ID); err != nil {
		return wrapAuthError("ResetPassword", err)
	}

	return nil
}

func (uc *authUseCase) issueLoginTokens(
	ctx context.Context,
	user *entity.User,
	ipAddress, userAgent, existingRefreshToken string,
) (*LoginOutput, error) {
	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email, nil)
	if err != nil {
		return nil, fmt.Errorf("authUseCase.Login: %w", err)
	}

	rawRefreshToken := existingRefreshToken
	if rawRefreshToken == "" {
		rawRefreshToken, err = generateRawToken()
		if err != nil {
			return nil, fmt.Errorf("authUseCase.Login: %w", err)
		}

		now := time.Now().UTC()
		refreshToken := &entity.RefreshToken{
			ID:        uuid.New(),
			UserID:    user.ID,
			TokenHash: hashToken(rawRefreshToken),
			ExpiresAt: now.Add(refreshTokenTTL),
			IPAddress: ipAddress,
			UserAgent: userAgent,
			CreatedAt: now,
		}
		if err := uc.refreshTokenRepo.Create(ctx, refreshToken); err != nil {
			return nil, wrapAuthError("Login", err)
		}
	}

	return &LoginOutput{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		ExpiresIn:    accessTokenExpiresIn,
		User:         mapUserToOutput(user),
	}, nil
}

func (uc *authUseCase) findValidRefreshToken(
	ctx context.Context,
	rawRefreshToken string,
) (*entity.RefreshToken, *entity.User, error) {
	tokenHash := hashToken(rawRefreshToken)

	stored, err := uc.refreshTokenRepo.FindByTokenHash(ctx, tokenHash)
	if err != nil {
		if isNotFound(err) {
			return nil, nil, apperrors.NewUnauthorized("invalid refresh token")
		}
		return nil, nil, wrapAuthError("RefreshToken", err)
	}
	if !stored.IsValid() {
		return nil, nil, apperrors.NewUnauthorized("invalid refresh token")
	}

	user, err := uc.userRepo.FindByID(ctx, stored.UserID)
	if err != nil {
		return nil, nil, wrapAuthError("RefreshToken", err)
	}
	if !user.IsActive() {
		return nil, nil, apperrors.NewUnauthorized("account is disabled")
	}

	return stored, user, nil
}

func (uc *authUseCase) ensureEmailAvailable(ctx context.Context, email string) error {
	_, err := uc.userRepo.FindByEmail(ctx, email)
	if err == nil {
		return apperrors.NewConflict("email already exists")
	}
	if !isNotFound(err) {
		return wrapAuthError("Register", err)
	}
	return nil
}

func (uc *authUseCase) ensureUsernameAvailable(ctx context.Context, username string) error {
	_, err := uc.userRepo.FindByUsername(ctx, username)
	if err == nil {
		return apperrors.NewConflict("username already exists")
	}
	if !isNotFound(err) {
		return wrapAuthError("Register", err)
	}
	return nil
}

func (uc *authUseCase) rateLimit(ctx context.Context, key string) error {
	if uc.rateLimiter == nil {
		return nil
	}
	if err := uc.rateLimiter.Allow(ctx, key); err != nil {
		if _, ok := apperrors.IsAppError(err); ok {
			return err
		}
		return fmt.Errorf("authUseCase: %w", err)
	}
	return nil
}

func validateRegisterInput(input RegisterInput) error {
	if err := validateEmail(input.Email); err != nil {
		return err
	}
	if len(input.Password) < minPasswordLength {
		return apperrors.NewValidation("password must be at least 8 characters", nil)
	}
	if !usernamePattern.MatchString(input.Username) {
		return apperrors.NewValidation("username must be alphanumeric and 3-30 characters", nil)
	}
	if input.FullName == "" {
		return apperrors.NewValidation("full name is required", nil)
	}
	return nil
}

func validateEmail(email string) error {
	if _, err := mail.ParseAddress(email); err != nil {
		return apperrors.NewValidation("invalid email format", nil)
	}
	return nil
}

func mapUserToOutput(user *entity.User) UserOutput {
	return UserOutput{
		ID:        user.ID.String(),
		Username:  user.Username,
		Email:     user.Email,
		FullName:  user.FullName,
		AvatarURL: user.AvatarURL,
		Phone:     user.Phone,
		Status:    string(user.Status),
		CreatedAt: user.CreatedAt,
	}
}

func generateRawToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func hashToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func isNotFound(err error) bool {
	appErr, ok := apperrors.IsAppError(err)
	return ok && appErr.Code == apperrors.ErrCodeNotFound
}

func wrapAuthError(method string, err error) error {
	if _, ok := apperrors.IsAppError(err); ok {
		return err
	}
	return fmt.Errorf("authUseCase.%s: %w", method, err)
}
