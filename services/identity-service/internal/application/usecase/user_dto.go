package usecase

import "time"

// UserProfileOutput is the public user profile returned by user management endpoints.
type UserProfileOutput struct {
	ID          string     `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	FullName    string     `json:"full_name"`
	Phone       string     `json:"phone"`
	AvatarURL   string     `json:"avatar_url"`
	Status      string     `json:"status"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// UpdateProfileInput holds optional profile fields to update.
// Only non-nil fields are applied.
type UpdateProfileInput struct {
	FullName  *string
	Phone     *string
	AvatarURL *string
}
