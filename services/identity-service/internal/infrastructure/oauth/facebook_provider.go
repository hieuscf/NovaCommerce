package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/facebook"

	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	apperrors "github.com/novacommerce/pkg/errors"
)

const facebookGraphURL = "https://graph.facebook.com/me?fields=id,name,email,picture"

// facebookPicture mirrors the nested picture object in the Graph API response.
type facebookPicture struct {
	Data struct {
		URL string `json:"url"`
	} `json:"data"`
}

// facebookUserInfo is the subset of the Graph API /me response we need.
type facebookUserInfo struct {
	ID      string          `json:"id"`
	Name    string          `json:"name"`
	Email   string          `json:"email"`
	Picture facebookPicture `json:"picture"`
}

// FacebookProvider implements Provider for Facebook OAuth2.
type FacebookProvider struct {
	cfg *oauth2.Config
}

// NewFacebookProvider creates a FacebookProvider from the supplied config.
func NewFacebookProvider(cfg config.OAuthProviderConfig) *FacebookProvider {
	return &FacebookProvider{
		cfg: &oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{"email", "public_profile"},
			Endpoint:     facebook.Endpoint,
		},
	}
}

// GetAuthURL returns the Facebook authorisation URL with the CSRF state embedded.
func (p *FacebookProvider) GetAuthURL(state string) string {
	return p.cfg.AuthCodeURL(state)
}

// ExchangeCode swaps an authorisation code for tokens then fetches the user profile
// from the Facebook Graph API.
// Returns ErrOAuthEmailRequired when Facebook does not provide an email address
// (users may have phone-only accounts or revoke the email permission).
func (p *FacebookProvider) ExchangeCode(ctx context.Context, code string) (*entity.OAuthUserInfo, error) {
	token, err := p.cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("facebookProvider.ExchangeCode exchange: %w", err)
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
		AvatarURL:      info.Picture.Data.URL,
		AccessToken:    token.AccessToken,
		RefreshToken:   token.RefreshToken,
		ExpiresAt:      tokenExpiry(token),
	}, nil
}

func (p *FacebookProvider) fetchUserInfo(ctx context.Context, accessToken string) (*facebookUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, facebookGraphURL, nil)
	if err != nil {
		return nil, fmt.Errorf("facebookProvider: build graph request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: httpClientTimeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("facebookProvider: fetch graph: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("facebookProvider: graph API returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("facebookProvider: read graph body: %w", err)
	}

	var info facebookUserInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("facebookProvider: parse graph response: %w", err)
	}
	return &info, nil
}
