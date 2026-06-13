package validator

import (
	"encoding/json"
	"testing"

	apperrors "github.com/novacommerce/pkg/errors"
)

type signupRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"required,phone_vn"`
	Slug     string `json:"slug" validate:"required,slug"`
	Password string `json:"password" validate:"required,password_strength"`
}

func TestValidateSuccess(t *testing.T) {
	v := New()
	req := signupRequest{
		Email:    "user@example.com",
		Phone:    "0912345678",
		Slug:     "nova-product",
		Password: "Secret1!",
	}

	if err := v.Validate(req); err != nil {
		t.Fatalf("expected validation success, got %v", err)
	}
}

func TestValidateFailureReturnsAppError(t *testing.T) {
	v := New()
	req := signupRequest{}

	err := v.Validate(req)
	appErr, ok := apperrors.IsAppError(err)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != apperrors.ErrCodeValidation {
		t.Fatalf("expected validation code, got %s", appErr.Code)
	}

	details, ok := appErr.Details.([]FieldError)
	if !ok || len(details) == 0 {
		t.Fatalf("expected field error details, got %#v", appErr.Details)
	}
}

func TestPhoneVNTag(t *testing.T) {
	v := New()

	validPhones := []string{"0912345678", "0812345678", "0712345678", "0312345678", "0512345678"}
	for _, phone := range validPhones {
		if err := v.ValidateVar(phone, "phone_vn"); err != nil {
			t.Fatalf("expected valid phone %s, got %v", phone, err)
		}
	}

	invalidPhones := []string{"0212345678", "12345", "abc", "6912345678"}
	for _, phone := range invalidPhones {
		if err := v.ValidateVar(phone, "phone_vn"); err == nil {
			t.Fatalf("expected invalid phone %s", phone)
		}
	}
}

func TestSlugTag(t *testing.T) {
	v := New()

	if err := v.ValidateVar("valid-slug-123", "slug"); err != nil {
		t.Fatalf("expected valid slug, got %v", err)
	}

	invalid := []string{"Invalid", "bad_slug", "has space"}
	for _, slug := range invalid {
		if err := v.ValidateVar(slug, "slug"); err == nil {
			t.Fatalf("expected invalid slug %s", slug)
		}
	}
}

func TestPasswordStrengthTag(t *testing.T) {
	v := New()

	if err := v.ValidateVar("Secret1!", "password_strength"); err != nil {
		t.Fatalf("expected strong password, got %v", err)
	}

	weak := []string{"short1A", "nouppercase1", "NOLOWERCASE1", "NoDigitsHere"}
	for _, password := range weak {
		if err := v.ValidateVar(password, "password_strength"); err == nil {
			t.Fatalf("expected weak password %s to fail", password)
		}
	}
}

func TestValidateVarFailure(t *testing.T) {
	v := New()
	if err := v.ValidateVar("", "required"); err == nil {
		t.Fatal("expected required validation to fail")
	}
}

func TestErrorMessageFormat(t *testing.T) {
	v := New()
	req := signupRequest{Phone: "0212345678"}

	err := v.Validate(req)
	appErr, ok := apperrors.IsAppError(err)
	if !ok {
		t.Fatalf("expected AppError, got %v", err)
	}

	payload, marshalErr := json.Marshal(appErr)
	if marshalErr != nil {
		t.Fatalf("failed to marshal error: %v", marshalErr)
	}

	var decoded map[string]interface{}
	if err := json.Unmarshal(payload, &decoded); err != nil {
		t.Fatalf("failed to unmarshal error payload: %v", err)
	}
	if decoded["Code"] != apperrors.ErrCodeValidation {
		t.Fatalf("unexpected code in payload: %#v", decoded)
	}
}

func TestSingletonInstance(t *testing.T) {
	if New() != New() {
		t.Fatal("expected validator singleton instance")
	}
}
