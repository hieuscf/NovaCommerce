package entity

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

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
	Phone        string     `db:"phone"`
	FullName     string     `db:"full_name"`
	AvatarURL    string     `db:"avatar_url"`
	Status       UserStatus `db:"status"`
	LastLoginAt  *time.Time `db:"last_login_at"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at"`
}

// SetPassword hashes plain with bcrypt (cost 12) and stores it in PasswordHash.
func (u *User) SetPassword(plain string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcryptCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	return nil
}

// CheckPassword reports whether plain matches the stored bcrypt hash.
func (u *User) CheckPassword(plain string) bool {
	if u.PasswordHash == "" {
		return false
	}
	return bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(plain)) == nil
}

// IsActive reports whether the account is in active status.
func (u *User) IsActive() bool {
	return u.Status == UserStatusActive
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
