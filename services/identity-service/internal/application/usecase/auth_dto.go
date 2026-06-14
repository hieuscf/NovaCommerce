package usecase

import "time"

// RegisterInput holds registration request data.
type RegisterInput struct {
	Username string
	Email    string
	Password string
	FullName string
}

// LoginInput holds login request data.
type LoginInput struct {
	Identifier string
	Password   string
	IPAddress  string
	UserAgent  string
}

// ChangePasswordInput holds password change request data.
type ChangePasswordInput struct {
	CurrentPassword string
	NewPassword     string
}

// ResetPasswordInput holds password reset request data.
type ResetPasswordInput struct {
	Token       string
	NewPassword string
}

// UserOutput is the public user representation returned by auth use cases.
type UserOutput struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	AvatarURL string    `json:"avatar_url"`
	Phone     string    `json:"phone"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// LoginOutput holds issued tokens and the authenticated user.
type LoginOutput struct {
	AccessToken  string     `json:"access_token"`
	RefreshToken string     `json:"refresh_token"`
	ExpiresIn    int64      `json:"expires_in"`
	User         UserOutput `json:"user"`
}

// RegisterOutput holds the newly created user.
type RegisterOutput struct {
	User UserOutput `json:"user"`
}
