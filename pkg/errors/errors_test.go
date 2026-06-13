package errors

import (
	"errors"
	"net/http"
	"testing"
)

func TestConstructorsReturnCorrectCodeAndStatus(t *testing.T) {
	tests := []struct {
		name       string
		err        *AppError
		code       string
		httpStatus int
	}{
		{"not found", NewNotFound("missing"), ErrCodeNotFound, http.StatusNotFound},
		{"unauthorized", NewUnauthorized("denied"), ErrCodeUnauthorized, http.StatusUnauthorized},
		{"forbidden", NewForbidden("forbidden"), ErrCodeForbidden, http.StatusForbidden},
		{"bad request", NewBadRequest("invalid"), ErrCodeBadRequest, http.StatusBadRequest},
		{"validation", NewValidation("failed", nil), ErrCodeValidation, http.StatusBadRequest},
		{"conflict", NewConflict("exists"), ErrCodeConflict, http.StatusConflict},
		{"internal", NewInternal("boom"), ErrCodeInternal, http.StatusInternalServerError},
		{"timeout", NewTimeout("slow"), ErrCodeTimeout, http.StatusGatewayTimeout},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.err.Code != tt.code {
				t.Fatalf("expected code %s, got %s", tt.code, tt.err.Code)
			}
			if tt.err.HTTPStatus != tt.httpStatus {
				t.Fatalf("expected status %d, got %d", tt.httpStatus, tt.err.HTTPStatus)
			}
			if tt.err.Error() == "" {
				t.Fatal("expected non-empty error string")
			}
		})
	}
}

func TestIsAppError(t *testing.T) {
	appErr := NewBadRequest("invalid payload")
	if got, ok := IsAppError(appErr); !ok || got != appErr {
		t.Fatal("expected AppError type assertion to succeed")
	}

	if _, ok := IsAppError(errors.New("plain")); ok {
		t.Fatal("expected plain error to fail AppError assertion")
	}

	if _, ok := IsAppError(nil); ok {
		t.Fatal("expected nil error to fail AppError assertion")
	}
}

func TestHTTPStatusFallback(t *testing.T) {
	if status := HTTPStatus(NewNotFound("missing")); status != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", status)
	}

	if status := HTTPStatus(errors.New("plain")); status != http.StatusInternalServerError {
		t.Fatalf("expected default 500, got %d", status)
	}
}

func TestValidationDetails(t *testing.T) {
	details := []map[string]string{{"field": "email", "message": "required"}}
	err := NewValidation("Validation failed", details)
	if err.Details == nil {
		t.Fatal("expected validation details to be preserved")
	}
}

func TestNilAppErrorErrorString(t *testing.T) {
	var err *AppError
	if err.Error() != "" {
		t.Fatal("expected empty string for nil AppError")
	}
}

func TestNewTooManyRequests(t *testing.T) {
	err := NewTooManyRequests("slow down")
	if err.Code != ErrCodeTooManyRequests || err.HTTPStatus != http.StatusTooManyRequests {
		t.Fatalf("unexpected too many requests error: %#v", err)
	}
}
