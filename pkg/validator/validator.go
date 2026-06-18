package validator

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"sync"
	"unicode"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	apperrors "github.com/novacommerce/pkg/errors"
)

var (
	instance *Validator
	once     sync.Once

	phoneVNRegex = regexp.MustCompile(`^0[35789][0-9]{8}$`)
	slugRegex    = regexp.MustCompile(`^[a-z0-9-]+$`)
)

// FieldError describes a single validation failure.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Validator wraps go-playground/validator with NovaCommerce conventions.
type Validator struct {
	validate *validator.Validate
}

// New returns the shared Validator instance.
func New() *Validator {
	once.Do(func() {
		v := validator.New()
		v.RegisterTagNameFunc(func(field reflect.StructField) string {
			if jsonTag := field.Tag.Get("json"); jsonTag != "" {
				name := strings.Split(jsonTag, ",")[0]
				if name != "-" {
					return name
				}
			}
			return field.Name
		})

		_ = v.RegisterValidation("phone_vn", validatePhoneVN)
		_ = v.RegisterValidation("slug", validateSlug)
		_ = v.RegisterValidation("password_strength", validatePasswordStrength)
		_ = v.RegisterValidation("uuid4", validateUUID4)

		instance = &Validator{validate: v}
	})

	return instance
}

// Validate validates a struct and returns a validation AppError when invalid.
func (v *Validator) Validate(s interface{}) error {
	if err := v.validate.Struct(s); err != nil {
		return apperrors.NewValidation("Validation failed", formatValidationErrors(err))
	}
	return nil
}

// ValidateVar validates a single value against a tag expression.
func (v *Validator) ValidateVar(field interface{}, tag string) error {
	if err := v.validate.Var(field, tag); err != nil {
		return apperrors.NewValidation("Validation failed", formatValidationErrors(err))
	}
	return nil
}

func formatValidationErrors(err error) []FieldError {
	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		return []FieldError{{Field: "", Message: err.Error()}}
	}

	details := make([]FieldError, 0, len(validationErrors))
	for _, fieldErr := range validationErrors {
		details = append(details, FieldError{
			Field:   fieldErr.Field(),
			Message: humanReadableMessage(fieldErr),
		})
	}
	return details
}

func humanReadableMessage(fe validator.FieldError) string {
	field := fe.Field()

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters", field, fe.Param())
	case "phone_vn":
		return fmt.Sprintf("%s must be a valid Vietnamese phone number", field)
	case "slug":
		return fmt.Sprintf("%s must contain only lowercase letters, numbers, and hyphens", field)
	case "password_strength":
		return fmt.Sprintf("%s must be at least 8 characters and include uppercase, lowercase, and digit characters", field)
	case "uuid4":
		return fmt.Sprintf("%s must be a valid UUID", field)
	default:
		return fmt.Sprintf("%s failed on '%s' validation", field, fe.Tag())
	}
}

func validatePhoneVN(fl validator.FieldLevel) bool {
	return phoneVNRegex.MatchString(fl.Field().String())
}

func validateSlug(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if value == "" {
		return true
	}
	return slugRegex.MatchString(value)
}

func validatePasswordStrength(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if len(value) < 8 {
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

func validateUUID4(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	if value == "" {
		return true
	}
	_, err := uuid.Parse(value)
	return err == nil
}
