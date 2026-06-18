package errors

import (
	"fmt"
	"net/http"
)

// AppError represents a domain error with HTTP mapping.
type AppError struct {
	Code       string
	Message    string
	HTTPStatus int
	Details    interface{}
}

func (e *AppError) Error() string {
	if e == nil {
		return ""
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// 4xx Client Errors
const (
	ErrCodeNotFound        = "NOT_FOUND"
	ErrCodeUnauthorized    = "UNAUTHORIZED"
	ErrCodeForbidden       = "FORBIDDEN"
	ErrCodeBadRequest      = "BAD_REQUEST"
	ErrCodeValidation      = "VALIDATION_ERROR"
	ErrCodeConflict        = "CONFLICT"
	ErrCodeTooManyRequests = "TOO_MANY_REQUESTS"
	ErrCodeUnprocessable   = "UNPROCESSABLE_ENTITY"
)

// 5xx Server Errors
const (
	ErrCodeInternal           = "INTERNAL_ERROR"
	ErrCodeServiceUnavailable = "SERVICE_UNAVAILABLE"
	ErrCodeTimeout            = "TIMEOUT"
	ErrCodeDependencyFailed   = "DEPENDENCY_FAILED"
)

func newAppError(code, message string, status int, details interface{}) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		HTTPStatus: status,
		Details:    details,
	}
}

// New creates an AppError with a domain-specific code and message.
func New(code, message string) *AppError {
	return newAppError(code, message, statusForCode(code), nil)
}

func statusForCode(code string) int {
	switch code {
	case ErrCodeNotFound, "PRODUCT_NOT_FOUND", "VARIANT_NOT_FOUND":
		return http.StatusNotFound
	case ErrCodeForbidden, "PRODUCT_FORBIDDEN":
		return http.StatusForbidden
	case ErrCodeConflict, "DUPLICATE_SKU":
		return http.StatusConflict
	case ErrCodeUnprocessable, "MAX_IMAGES_EXCEEDED", "PRODUCT_NOT_ARCHIVABLE":
		return http.StatusUnprocessableEntity
	default:
		return http.StatusBadRequest
	}
}

// NewNotFound creates a not found error.
func NewNotFound(message string) *AppError {
	return newAppError(ErrCodeNotFound, message, http.StatusNotFound, nil)
}

// NewUnauthorized creates an unauthorized error.
func NewUnauthorized(message string) *AppError {
	return newAppError(ErrCodeUnauthorized, message, http.StatusUnauthorized, nil)
}

// NewForbidden creates a forbidden error.
func NewForbidden(message string) *AppError {
	return newAppError(ErrCodeForbidden, message, http.StatusForbidden, nil)
}

// NewBadRequest creates a bad request error.
func NewBadRequest(message string) *AppError {
	return newAppError(ErrCodeBadRequest, message, http.StatusBadRequest, nil)
}

// NewValidation creates a validation error with optional details.
func NewValidation(message string, details interface{}) *AppError {
	return newAppError(ErrCodeValidation, message, http.StatusBadRequest, details)
}

// NewConflict creates a conflict error.
func NewConflict(message string) *AppError {
	return newAppError(ErrCodeConflict, message, http.StatusConflict, nil)
}

// NewInternal creates an internal server error.
func NewInternal(message string) *AppError {
	return newAppError(ErrCodeInternal, message, http.StatusInternalServerError, nil)
}

// NewTimeout creates a timeout error.
func NewTimeout(message string) *AppError {
	return newAppError(ErrCodeTimeout, message, http.StatusGatewayTimeout, nil)
}

// NewTooManyRequests creates a rate limit error.
func NewTooManyRequests(message string) *AppError {
	return newAppError(ErrCodeTooManyRequests, message, http.StatusTooManyRequests, nil)
}

// IsAppError safely type-asserts an error to *AppError.
func IsAppError(err error) (*AppError, bool) {
	if err == nil {
		return nil, false
	}

	appErr, ok := err.(*AppError)
	return appErr, ok
}

// IsNotFound reports whether err is a NOT_FOUND AppError.
func IsNotFound(err error) bool {
	appErr, ok := IsAppError(err)
	return ok && appErr.Code == ErrCodeNotFound
}

// HTTPStatus returns the HTTP status code for an error, defaulting to 500.
func HTTPStatus(err error) int {
	if appErr, ok := IsAppError(err); ok {
		return appErr.HTTPStatus
	}
	return http.StatusInternalServerError
}
