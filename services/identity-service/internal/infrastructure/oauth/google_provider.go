package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	apperrors "github.com/novacommerce/pkg/errors"
)

const (
	googleUserInfoURL = "https://www.googleapis.com/oauth2/v2/userinfo"
	httpClientTimeout = 10 * time.Second
)

// googleUserInfo is the subset of Google's /oauth2/v2/userinfo response we need.
type googleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// GoogleProvider implements Provider for Google OAuth2.
type GoogleProvider struct {
	cfg *oauth2.Config
}

// NewGoogleProvider creates a GoogleProvider from the supplied config.
func NewGoogleProvider(cfg config.OAuthProviderConfig) *GoogleProvider {
	return &GoogleProvider{
		cfg: &oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

// GetAuthURL returns the Google consent-page URL with the CSRF state embedded.
func (p *GoogleProvider) GetAuthURL(state string) string {
	return p.cfg.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// ExchangeCode swaps an authorisation code for tokens then fetches the user profile.
// Returns ErrOAuthEmailRequired when Google does not provide an email address.
func (p *GoogleProvider) ExchangeCode(ctx context.Context, code string) (*entity.OAuthUserInfo, error) {
	token, err := p.cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("googleProvider.ExchangeCode exchange: %w", err)
	}

	info, err := p.fetchUserInfo(ctx, token.AccessToken)
	if err != nil {
		return nil, err
	}

	if info.Email == "" {
		return nil, apperrors.NewBadRequest(entity.ErrOAuthEmailRequired.Error())
	}

	return &entity.OAuthUserInfo{
		ProviderUserID: info.ID,
		Email:          info.Email,
		Name:           info.Name,
		AvatarURL:      info.Picture,
		AccessToken:    token.AccessToken,
		RefreshToken:   token.RefreshToken,
		ExpiresAt:      tokenExpiry(token),
	}, nil
}

func (p *GoogleProvider) fetchUserInfo(ctx context.Context, accessToken string) (*googleUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleUserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("googleProvider: build userinfo request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: httpClientTimeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("googleProvider: fetch userinfo: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("googleProvider: userinfo returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("googleProvider: read userinfo body: %w", err)
	}

	var info googleUserInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("googleProvider: parse userinfo: %w", err)
	}
	return &info, nil
}

// tokenExpiry returns a pointer to the token expiry time, or nil when no expiry
// is set (i.e. token.Expiry.IsZero()).
func tokenExpiry(t *oauth2.Token) *time.Time {
	if t.Expiry.IsZero() {
		return nil
	}
	exp := t.Expiry
	return &exp
}
