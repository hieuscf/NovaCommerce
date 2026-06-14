//go:build unit

package validator_test

import (
	"testing"

	"github.com/novacommerce/identity-service/internal/application/validator"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateRegisterInput_Success(t *testing.T) {
	err := validator.ValidateRegisterInput("johndoe", "john@example.com", "SecurePass123", "John Doe")
	assert.NoError(t, err)
}

func TestValidateRegisterInput_WeakPassword(t *testing.T) {
	err := validator.ValidateRegisterInput("johndoe", "john@example.com", "password", "John Doe")
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}

func TestValidateChangePasswordInput_SamePassword(t *testing.T) {
	err := validator.ValidateChangePasswordInput("SecurePass123", "SecurePass123")
	require.Error(t, err)
	appErr, ok := apperrors.IsAppError(err)
	require.True(t, ok)
	assert.Equal(t, apperrors.ErrCodeValidation, appErr.Code)
}
