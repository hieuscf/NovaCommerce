package entity

import (
	"errors"
	"time"
)

// ErrOAuthEmailRequired is returned by an OAuthProvider when the OAuth flow
// completes but the provider does not supply an email address.
var ErrOAuthEmailRequired = errors.New("oauth: provider did not return an email address")

// Supported OAuth provider identifiers — must match the oauth_accounts.provider column.
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
