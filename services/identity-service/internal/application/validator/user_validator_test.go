package validator_test

import (
	"testing"

	"github.com/novacommerce/identity-service/internal/application/validator"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func ptr[T any](v T) *T {
	return &v
}

func TestValidateUpdateProfileInput(t *testing.T) {
	t.Run("requires at least one field", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(nil, nil, nil)
		require.Error(t, err)
		appErr, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.Equal(t, apperrors.ErrCodeBadRequest, appErr.Code)
	})

	t.Run("valid full name", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(ptr("Valid Name"), nil, nil)
		assert.NoError(t, err)
	})

	t.Run("invalid full name", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(ptr("A"), nil, nil)
		require.Error(t, err)
	})

	t.Run("valid phone", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(nil, ptr("0901234567"), nil)
		assert.NoError(t, err)
	})

	t.Run("invalid phone", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(nil, ptr("123"), nil)
		require.Error(t, err)
	})

	t.Run("valid avatar url", func(t *testing.T) {
		err := validator.ValidateUpdateProfileInput(nil, nil, ptr("https://example.com/avatar.png"))
		assert.NoError(t, err)
	})
}

func TestParseUpdateUserStatus(t *testing.T) {
	t.Run("active", func(t *testing.T) {
		status, err := validator.ParseUpdateUserStatus("active")
		require.NoError(t, err)
		assert.Equal(t, "active", string(status))
	})

	t.Run("disabled maps to inactive", func(t *testing.T) {
		status, err := validator.ParseUpdateUserStatus("disabled")
		require.NoError(t, err)
		assert.Equal(t, "inactive", string(status))
	})

	t.Run("invalid status", func(t *testing.T) {
		_, err := validator.ParseUpdateUserStatus("banned")
		require.Error(t, err)
		appErr, ok := apperrors.IsAppError(err)
		require.True(t, ok)
		assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
	})
}
