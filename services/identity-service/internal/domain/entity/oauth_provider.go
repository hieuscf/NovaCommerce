package entity

import "time"

// Supported OAuth provider identifiers — must match the oauth_provider DB enum.
const (
	ProviderGoogle   = "google"
	ProviderFacebook = "facebook"
	ProviderGitHub   = "github"
	ProviderApple    = "apple"
)

// OAuthUserInfo carries the normalised profile data returned by an OAuth provider
// after a successful authorisation exchange.
type OAuthUserInfo struct {
	ProviderUserID string
	Email          string
	Name           string
	AvatarURL      string
	AccessToken    string
	RefreshToken   string
	ExpiresAt      *time.Time
}
