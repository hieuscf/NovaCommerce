package entity

import (
	"time"

	"github.com/google/uuid"
)

// UserStatus represents the lifecycle state of a user account.
type UserStatus string

const (
	UserStatusActive   UserStatus = "active"
	UserStatusInactive UserStatus = "inactive"
	UserStatusBanned   UserStatus = "banned"
)

// User is the core identity aggregate root.
type User struct {
	ID           uuid.UUID  `db:"id"`
	Username     string     `db:"username"`
	Email        string     `db:"email"`
	PasswordHash string     `db:"password_hash"`
	Phone        *string    `db:"phone"`
	FullName     *string    `db:"full_name"`
	AvatarURL    *string    `db:"avatar_url"`
	Status       UserStatus `db:"status"`
	LastLoginAt  *time.Time `db:"last_login_at"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at"`
}

// Role defines a named set of permissions.
type Role struct {
	ID          uuid.UUID `db:"id"`
	Name        string    `db:"name"`
	Description *string   `db:"description"`
	CreatedAt   time.Time `db:"created_at"`
}

// Permission defines a resource/action pair for RBAC.
type Permission struct {
	ID          uuid.UUID `db:"id"`
	Resource    string    `db:"resource"`
	Action      string    `db:"action"`
	Description *string   `db:"description"`
}

// UserRole links a user to a role assignment.
type UserRole struct {
	UserID     uuid.UUID `db:"user_id"`
	RoleID     uuid.UUID `db:"role_id"`
	AssignedAt time.Time `db:"assigned_at"`
}

// RolePermission links a role to a permission.
type RolePermission struct {
	RoleID       uuid.UUID `db:"role_id"`
	PermissionID uuid.UUID `db:"permission_id"`
}

// RefreshToken stores a hashed refresh token for a user session.
type RefreshToken struct {
	ID         uuid.UUID `db:"id"`
	UserID     uuid.UUID `db:"user_id"`
	TokenHash  string    `db:"token_hash"`
	DeviceInfo *string   `db:"device_info"`
	IsRevoked  bool      `db:"is_revoked"`
	ExpiresAt  time.Time `db:"expires_at"`
	CreatedAt  time.Time `db:"created_at"`
}

// OAuthAccount links an external OAuth provider to a user.
type OAuthAccount struct {
	ID             uuid.UUID  `db:"id"`
	UserID         uuid.UUID  `db:"user_id"`
	Provider       string     `db:"provider"`
	ProviderUserID string     `db:"provider_user_id"`
	AccessToken    *string    `db:"access_token"`
	RefreshToken   *string    `db:"refresh_token"`
	TokenExpiresAt *time.Time `db:"token_expires_at"`
	CreatedAt      time.Time  `db:"created_at"`
}
