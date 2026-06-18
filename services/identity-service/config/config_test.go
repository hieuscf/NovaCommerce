package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNormalizeBareDuration(t *testing.T) {
	t.Parallel()

	assert.Equal(t, 15*time.Minute, normalizeBareDuration(15, time.Minute))
	assert.Equal(t, 15*time.Minute, normalizeBareDuration(15*time.Minute, time.Minute))
	assert.Equal(t, 7*24*time.Hour, normalizeBareDuration(7, 24*time.Hour))
}

func TestLoadJWTAccessTokenTTLFromEnv(t *testing.T) {
	t.Setenv("JWT_ACCESS_TTL", "15m")
	t.Setenv("JWT_REFRESH_TTL", "168h")

	cfg, err := Load()
	require.NoError(t, err)
	assert.Equal(t, 15*time.Minute, cfg.JWT.AccessTokenTTL)
}
