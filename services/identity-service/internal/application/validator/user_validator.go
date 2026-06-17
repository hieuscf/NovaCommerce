package validator

import (
	"github.com/novacommerce/identity-service/internal/domain/entity"
	pkgvalidator "github.com/novacommerce/pkg/validator"
	apperrors "github.com/novacommerce/pkg/errors"
)

// ValidateUpdateProfileInput validates optional profile update fields.
// Only non-nil pointers are validated.
func ValidateUpdateProfileInput(fullName, phone, avatarURL *string) error {
	if fullName == nil && phone == nil && avatarURL == nil {
		return apperrors.NewBadRequest("no fields to update")
	}

	v := pkgvalidator.New()

	if fullName != nil {
		if err := v.ValidateVar(*fullName, "required,min=2,max=100"); err != nil {
			return err
		}
	}
	if phone != nil {
		if err := v.ValidateVar(*phone, "omitempty,max=20,phone_vn"); err != nil {
			return err
		}
	}
	if avatarURL != nil {
		if err := v.ValidateVar(*avatarURL, "omitempty,url,max=2048"); err != nil {
			return err
		}
	}

	return nil
}

// ParseUpdateUserStatus maps an API status value to the domain user status.
func ParseUpdateUserStatus(status string) (entity.UserStatus, error) {
	switch status {
	case "active":
		return entity.UserStatusActive, nil
	case "disabled":
		return entity.UserStatusInactive, nil
	default:
		return "", apperrors.NewValidation("status must be active or disabled", nil)
	}
}
