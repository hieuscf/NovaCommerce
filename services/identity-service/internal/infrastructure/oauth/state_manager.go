package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	stateKeyPrefix = "oauth:state:"
	stateTTL       = 10 * time.Minute
	stateByteLen   = 32
)

// StateManager generates and validates CSRF state parameters backed by Redis.
// Each state value is a 32-byte cryptographically random string that lives in
// Redis for 10 minutes and is consumed (deleted) on first use.
type StateManager struct {
	redis *redis.Client
}

// NewStateManager creates a Redis-backed StateManager.
func NewStateManager(client *redis.Client) *StateManager {
	return &StateManager{redis: client}
}

// GenerateState creates a URL-safe random state string and stores it in Redis
// with a 10-minute TTL. The caller must embed the returned value in the OAuth
// redirect URL so it can be verified on callback.
func (m *StateManager) GenerateState(ctx context.Context) (string, error) {
	b := make([]byte, stateByteLen)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("stateManager.GenerateState: %w", err)
	}

	state := base64.RawURLEncoding.EncodeToString(b)
	key := stateKeyPrefix + state

	if err := m.redis.Set(ctx, key, "1", stateTTL).Err(); err != nil {
		return "", fmt.Errorf("stateManager.GenerateState: redis set: %w", err)
	}
	return state, nil
}

// ValidateState returns true when state was previously issued by GenerateState
// and has not yet expired. The key is atomically deleted on success to prevent
// replay attacks. Returns false on any error or unknown/expired state.
func (m *StateManager) ValidateState(ctx context.Context, state string) bool {
	key := stateKeyPrefix + state
	deleted, err := m.redis.Del(ctx, key).Result()
	if err != nil {
		return false
	}
	return deleted == 1
}
