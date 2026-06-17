//go:build unit

package mocks

import (
	"context"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	"github.com/stretchr/testify/mock"
)

type UserRepository struct {
	mock.Mock
}

func (m *UserRepository) Create(ctx context.Context, user *entity.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func (m *UserRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func (m *UserRepository) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func (m *UserRepository) FindByEmailOrUsername(ctx context.Context, identifier string) (*entity.User, error) {
	args := m.Called(ctx, identifier)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func (m *UserRepository) Update(ctx context.Context, user *entity.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *UserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	args := m.Called(ctx, userID, passwordHash)
	return args.Error(0)
}

func (m *UserRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *UserRepository) List(ctx context.Context, filter repository.UserFilter, cursor string, limit int) ([]*entity.User, int64, error) {
	args := m.Called(ctx, filter, cursor, limit)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*entity.User), args.Get(1).(int64), args.Error(2)
}

func (m *UserRepository) UpdateStatus(ctx context.Context, userID uuid.UUID, status entity.UserStatus) (*entity.User, error) {
	args := m.Called(ctx, userID, status)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

type RefreshTokenRepository struct {
	mock.Mock
}

func (m *RefreshTokenRepository) Create(ctx context.Context, token *entity.RefreshToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *RefreshTokenRepository) FindByTokenHash(ctx context.Context, hash string) (*entity.RefreshToken, error) {
	args := m.Called(ctx, hash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.RefreshToken), args.Error(1)
}

func (m *RefreshTokenRepository) RevokeByID(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *RefreshTokenRepository) RevokeAllByUserID(ctx context.Context, userID uuid.UUID) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *RefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

type PasswordResetTokenRepository struct {
	mock.Mock
}

func (m *PasswordResetTokenRepository) Create(ctx context.Context, token *entity.PasswordResetToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *PasswordResetTokenRepository) FindByTokenHash(ctx context.Context, hash string) (*entity.PasswordResetToken, error) {
	args := m.Called(ctx, hash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.PasswordResetToken), args.Error(1)
}

func (m *PasswordResetTokenRepository) MarkUsed(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *PasswordResetTokenRepository) DeleteExpiredByUserID(ctx context.Context, userID uuid.UUID) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

type JWTService struct {
	mock.Mock
}

func (m *JWTService) GenerateAccessToken(userID uuid.UUID, email string, roles []string) (string, error) {
	args := m.Called(userID, email, roles)
	return args.String(0), args.Error(1)
}

func (m *JWTService) ValidateAccessToken(token string) (*port.Claims, error) {
	args := m.Called(token)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*port.Claims), args.Error(1)
}

type EmailService struct {
	mock.Mock
}

func (m *EmailService) SendPasswordReset(to, resetToken string) error {
	args := m.Called(to, resetToken)
	return args.Error(0)
}

func (m *EmailService) SendWelcome(to, username string) error {
	args := m.Called(to, username)
	return args.Error(0)
}

type KafkaProducer struct {
	mock.Mock
}

func (m *KafkaProducer) Publish(ctx context.Context, topic string, key string, payload interface{}) error {
	args := m.Called(ctx, topic, key, payload)
	return args.Error(0)
}

type RateLimiter struct {
	mock.Mock
}

func (m *RateLimiter) Allow(ctx context.Context, key string) error {
	args := m.Called(ctx, key)
	return args.Error(0)
}

var (
	_ repository.UserRepository               = (*UserRepository)(nil)
	_ repository.RefreshTokenRepository       = (*RefreshTokenRepository)(nil)
	_ repository.PasswordResetTokenRepository = (*PasswordResetTokenRepository)(nil)
	_ port.JWTService                         = (*JWTService)(nil)
	_ port.EmailService                       = (*EmailService)(nil)
	_ port.KafkaProducer                      = (*KafkaProducer)(nil)
	_ port.RateLimiter                        = (*RateLimiter)(nil)
)
