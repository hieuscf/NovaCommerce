package validator

import (
	"errors"
	"unicode"

	"github.com/go-playground/validator/v10"
	apperrors "github.com/novacommerce/pkg/errors"
)

var validate = validator.New()

func init() {
	if err := validate.RegisterValidation("password_strength", passwordStrength); err != nil {
		panic("register password_strength validator: " + err.Error())
	}
}

type registerInput struct {
	Username string `validate:"required,min=3,max=30,alphanum"`
	Email    string `validate:"required,email,max=255"`
	Password string `validate:"required,min=8,max=72,password_strength"`
	FullName string `validate:"required,min=2,max=100"`
}

type loginInput struct {
	Identifier string `validate:"required,min=3,max=255"`
	Password   string `validate:"required,min=1"`
}

type changePasswordInput struct {
	CurrentPassword string `validate:"required"`
	NewPassword     string `validate:"required,min=8,max=72,password_strength"`
}

type resetPasswordInput struct {
	Token       string `validate:"required,min=32"`
	NewPassword string `validate:"required,min=8,max=72,password_strength"`
}

// ValidateRegisterInput validates registration fields.
func ValidateRegisterInput(username, email, password, fullName string) error {
	return validateStruct(registerInput{
		Username: username,
		Email:    email,
		Password: password,
		FullName: fullName,
	})
}

// ValidateLoginInput validates login fields.
func ValidateLoginInput(identifier, password string) error {
	return validateStruct(loginInput{
		Identifier: identifier,
		Password:   password,
	})
}

// ValidateChangePasswordInput validates password change fields.
func ValidateChangePasswordInput(currentPassword, newPassword string) error {
	if err := validateStruct(changePasswordInput{
		CurrentPassword: currentPassword,
		NewPassword:     newPassword,
	}); err != nil {
		return err
	}
	if currentPassword == newPassword {
		return apperrors.NewValidation("new password must differ from current password", nil)
	}
	return nil
}

// ValidateResetPasswordInput validates password reset fields.
func ValidateResetPasswordInput(token, newPassword string) error {
	return validateStruct(resetPasswordInput{
		Token:       token,
		NewPassword: newPassword,
	})
}

// ValidateEmail validates a single email address.
func ValidateEmail(email string) error {
	return validateStruct(struct {
		Email string `validate:"required,email,max=255"`
	}{Email: email})
}

func passwordStrength(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if value == "" {
		return false
	}

	var hasUpper, hasLower, hasDigit bool
	for _, r := range value {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasDigit = true
		}
	}

	return hasUpper && hasLower && hasDigit
}

func validateStruct(input any) error {
	if err := validate.Struct(input); err != nil {
		return mapValidationError(err)
	}
	return nil
}

func mapValidationError(err error) error {
	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		return apperrors.NewValidation(validationErrs.Error(), nil)
	}
	return apperrors.NewValidation(err.Error(), nil)
}
