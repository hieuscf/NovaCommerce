package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
)

// OAuthOutput is returned by HandleCallback on successful authentication.
type OAuthOutput struct {
	AccessToken  string     `json:"access_token"`
	RefreshToken string     `json:"refresh_token"`
	ExpiresIn    int64      `json:"expires_in"`
	User         UserOutput `json:"user"`
	IsNewUser    bool       `json:"is_new_user"`
}

// OAuthUseCase defines the OAuth2 login and callback operations.
type OAuthUseCase interface {
	// GetAuthURL generates a provider consent-page URL with a CSRF state parameter.
	GetAuthURL(ctx context.Context, provider, redirectURL string) (string, error)

	// HandleCallback exchanges the authorisation code, resolves or creates the
	// associated user, and returns a full token pair.
	HandleCallback(ctx context.Context, provider, code, state string) (*OAuthOutput, error)
}

type oauthUseCase struct {
	userRepo         repository.UserRepository
	roleRepo         repository.RoleRepository
	oauthRepo        repository.OAuthRepository
	outboxRepo       repository.OutboxRepository
	refreshTokenRepo repository.RefreshTokenRepository
	jwtService       port.JWTService
	providers        map[string]port.OAuthProvider
	stateManager     port.OAuthStateManager
	transactor       port.Transactor
	kafkaProducer    port.KafkaProducer
}

// NewOAuthUseCase creates an OAuthUseCase with the given dependencies.
func NewOAuthUseCase(
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	oauthRepo repository.OAuthRepository,
	outboxRepo repository.OutboxRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtService port.JWTService,
	providers map[string]port.OAuthProvider,
	stateManager port.OAuthStateManager,
	transactor port.Transactor,
	kafkaProducer port.KafkaProducer,
) OAuthUseCase {
	return &oauthUseCase{
		userRepo:         userRepo,
		roleRepo:         roleRepo,
		oauthRepo:        oauthRepo,
		outboxRepo:       outboxRepo,
		refreshTokenRepo: refreshTokenRepo,
		jwtService:       jwtService,
		providers:        providers,
		stateManager:     stateManager,
		transactor:       transactor,
		kafkaProducer:    kafkaProducer,
	}
}

// GetAuthURL validates the provider, generates a CSRF state persisted to Redis,
// and returns the provider's consent-page URL.
// redirectURL is accepted for forward-compatibility (e.g. encoding a return path
// in state) but does not override the provider's pre-configured redirect URL.
func (uc *oauthUseCase) GetAuthURL(ctx context.Context, provider, _ string) (string, error) {
	p, err := uc.lookupProvider(provider)
	if err != nil {
		return "", err
	}

	state, err := uc.stateManager.GenerateState(ctx)
	if err != nil {
		return "", fmt.Errorf("oauthUseCase.GetAuthURL: %w", err)
	}

	return p.GetAuthURL(state), nil
}

// HandleCallback processes the OAuth2 callback:
//  1. Validates the CSRF state.
//  2. Exchanges the code for tokens and fetches the provider profile.
//  3. Inside a single DB transaction: finds or creates the linked user and
//     oauth_account, writing an outbox event for new user registrations.
//  4. Issues a JWT access token and refresh token.
func (uc *oauthUseCase) HandleCallback(ctx context.Context, provider, code, state string) (*OAuthOutput, error) {
	if !uc.stateManager.ValidateState(ctx, state) {
		return nil, apperrors.NewUnauthorized("invalid or expired oauth state")
	}

	p, err := uc.lookupProvider(provider)
	if err != nil {
		return nil, err
	}

	info, err := p.ExchangeCode(ctx, code)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			return nil, appErr
		}
		return nil, fmt.Errorf("oauthUseCase.HandleCallback: exchange code: %w", err)
	}

	// resolvedUser is set inside the transaction so we can issue tokens after it.
	var resolvedUser *entity.User
	var isNewUser bool

	txErr := uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		user, newUser, err := uc.resolveUser(txCtx, provider, info)
		if err != nil {
			return err
		}
		resolvedUser = user
		isNewUser = newUser
		return nil
	})
	if txErr != nil {
		return nil, txErr
	}

	output, err := uc.issueOAuthTokens(ctx, resolvedUser)
	if err != nil {
		return nil, err
	}
	output.IsNewUser = isNewUser
	return output, nil
}

// resolveUser is called inside a transaction. It returns the user that should
// receive the JWT along with whether this is a brand-new registration.
func (uc *oauthUseCase) resolveUser(
	ctx context.Context,
	provider string,
	info *entity.OAuthUserInfo,
) (*entity.User, bool, error) {
	// Case 1: existing OAuth link — refresh tokens and load user.
	existing, err := uc.oauthRepo.FindByProvider(ctx, provider, info.ProviderUserID)
	if err != nil && !isNotFound(err) {
		return nil, false, fmt.Errorf("oauthUseCase: find oauth account: %w", err)
	}

	if existing != nil {
		existing.AccessToken = info.AccessToken
		existing.RefreshToken = info.RefreshToken
		existing.ExpiresAt = info.ExpiresAt
		existing.Name = info.Name
		existing.AvatarURL = info.AvatarURL
		if err := uc.oauthRepo.Update(ctx, existing); err != nil {
			return nil, false, fmt.Errorf("oauthUseCase: update oauth tokens: %w", err)
		}

		user, err := uc.userRepo.FindByID(ctx, existing.UserID)
		if err != nil {
			return nil, false, fmt.Errorf("oauthUseCase: load user for existing oauth: %w", err)
		}
		if !user.IsActive() {
			return nil, false, apperrors.NewUnauthorized("account is disabled")
		}
		return user, false, nil
	}

	// Case 2: no existing link — find or create user, then link oauth_account.
	user, newUser, err := uc.findOrCreateUser(ctx, info)
	if err != nil {
		return nil, false, err
	}

	now := time.Now().UTC()
	oauthAccount := &entity.OAuthAccount{
		ID:             uuid.New(),
		UserID:         user.ID,
		Provider:       provider,
		ProviderUserID: info.ProviderUserID,
		Email:          info.Email,
		Name:           info.Name,
		AvatarURL:      info.AvatarURL,
		AccessToken:    info.AccessToken,
		RefreshToken:   info.RefreshToken,
		ExpiresAt:      info.ExpiresAt,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if err := uc.oauthRepo.Create(ctx, oauthAccount); err != nil {
		return nil, false, fmt.Errorf("oauthUseCase: create oauth account: %w", err)
	}

	if newUser {
		if err := uc.writeRegistrationEvent(ctx, user, provider); err != nil {
			return nil, false, err
		}
	}

	return user, newUser, nil
}

// findOrCreateUser either links to an existing email owner or creates a fresh user.
func (uc *oauthUseCase) findOrCreateUser(
	ctx context.Context,
	info *entity.OAuthUserInfo,
) (*entity.User, bool, error) {
	existingUser, err := uc.userRepo.FindByEmail(ctx, info.Email)
	if err != nil && !isNotFound(err) {
		return nil, false, fmt.Errorf("oauthUseCase: find user by email: %w", err)
	}

	if existingUser != nil {
		if !existingUser.IsActive() {
			return nil, false, apperrors.NewUnauthorized("account is disabled")
		}
		return existingUser, false, nil
	}

	// Create a new user — password is intentionally empty (OAuth-only account).
	now := time.Now().UTC()
	newUser := &entity.User{
		ID:        uuid.New(),
		Username:  oauthUsername(info.ProviderUserID),
		Email:     info.Email,
		FullName:  info.Name,
		AvatarURL: info.AvatarURL,
		Status:    entity.UserStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		return nil, false, fmt.Errorf("oauthUseCase: create user: %w", err)
	}

	if err := assignDefaultCustomerRole(ctx, uc.roleRepo, newUser.ID); err != nil {
		return nil, false, fmt.Errorf("oauthUseCase: %w", err)
	}

	return newUser, true, nil
}

// writeRegistrationEvent persists an outbox event for new OAuth-registered users.
// The event is written inside the active transaction so it is never lost.
func (uc *oauthUseCase) writeRegistrationEvent(
	ctx context.Context,
	user *entity.User,
	provider string,
) error {
	type oauthRegisteredPayload struct {
		Type      string    `json:"type"`
		UserID    uuid.UUID `json:"user_id"`
		Email     string    `json:"email"`
		Provider  string    `json:"provider"`
		Source    string    `json:"source"`
		Timestamp time.Time `json:"timestamp"`
	}

	raw, err := json.Marshal(oauthRegisteredPayload{
		Type:      eventUserRegistered,
		UserID:    user.ID,
		Email:     user.Email,
		Provider:  provider,
		Source:    "oauth",
		Timestamp: time.Now().UTC(),
	})
	if err != nil {
		return fmt.Errorf("oauthUseCase: marshal registration event: %w", err)
	}

	event := &entity.OutboxEvent{
		ID:        uuid.New(),
		Topic:     topicUserEvents,
		Key:       user.ID.String(),
		Payload:   raw,
		CreatedAt: time.Now().UTC(),
	}
	if err := uc.outboxRepo.Create(ctx, event); err != nil {
		return fmt.Errorf("oauthUseCase: persist outbox event: %w", err)
	}
	return nil
}

// issueOAuthTokens generates a JWT access token and a refresh token for user.
func (uc *oauthUseCase) issueOAuthTokens(ctx context.Context, user *entity.User) (*OAuthOutput, error) {
	roleNames, err := loadRoleNames(ctx, uc.roleRepo, user.ID)
	if err != nil {
		return nil, wrapAuthError("issueOAuthTokens", err)
	}

	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email, roleNames)
	if err != nil {
		return nil, fmt.Errorf("oauthUseCase.issueOAuthTokens: %w", err)
	}

	rawRefresh, err := generateRawToken()
	if err != nil {
		return nil, fmt.Errorf("oauthUseCase.issueOAuthTokens: %w", err)
	}

	now := time.Now().UTC()
	refreshToken := &entity.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: hashToken(rawRefresh),
		ExpiresAt: now.Add(refreshTokenTTL),
		CreatedAt: now,
	}
	if err := uc.refreshTokenRepo.Create(ctx, refreshToken); err != nil {
		return nil, wrapAuthError("issueOAuthTokens", err)
	}

	return &OAuthOutput{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
		ExpiresIn:    accessTokenExpiresIn,
		User:         mapUserToOutput(user),
	}, nil
}

// lookupProvider retrieves a provider by name or returns a bad-request error.
func (uc *oauthUseCase) lookupProvider(provider string) (port.OAuthProvider, error) {
	p, ok := uc.providers[strings.ToLower(provider)]
	if !ok {
		return nil, apperrors.NewBadRequest(fmt.Sprintf("unsupported oauth provider: %s", provider))
	}
	return p, nil
}

// oauthUsername derives a stable username from the provider user ID.
// Format: "oauth_<first12charsOfProviderID>" capped to 50 chars (users.username VARCHAR(50)).
func oauthUsername(providerUserID string) string {
	suffix := providerUserID
	if len(suffix) > 12 {
		suffix = suffix[:12]
	}
	name := "oauth_" + suffix
	if len(name) > 50 {
		name = name[:50]
	}
	return name
}
