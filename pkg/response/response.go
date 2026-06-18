package response

import (
	"encoding/json"
	"net/http"

	apperrors "github.com/novacommerce/pkg/errors"
)

// Response is the standard API envelope.
type Response struct {
	Data  interface{}  `json:"data"`
	Meta  *Meta        `json:"meta,omitempty"`
	Error *ErrorDetail `json:"error"`
}

// Meta holds pagination and list metadata.
type Meta struct {
	Page       int    `json:"page,omitempty"`
	Limit      int    `json:"limit,omitempty"`
	Total      int64  `json:"total,omitempty"`
	NextCursor string `json:"next_cursor,omitempty"`
	HasMore    bool   `json:"has_more"`
}

// ErrorDetail describes an API error payload.
type ErrorDetail struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func writeJSON(w http.ResponseWriter, statusCode int, payload Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

// JSON writes a custom JSON response envelope.
func JSON(w http.ResponseWriter, statusCode int, data interface{}) {
	writeJSON(w, statusCode, Response{Data: data})
}

// Success writes a 200 OK response.
func Success(w http.ResponseWriter, data interface{}) {
	JSON(w, http.StatusOK, data)
}

// SuccessWithMeta writes a 200 OK response with metadata.
func SuccessWithMeta(w http.ResponseWriter, data interface{}, meta *Meta) {
	writeJSON(w, http.StatusOK, Response{Data: data, Meta: meta})
}

// Created writes a 201 Created response.
func Created(w http.ResponseWriter, data interface{}) {
	JSON(w, http.StatusCreated, data)
}

// NoContent writes a 204 No Content response.
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Paginated writes a 200 OK paginated list response.
func Paginated(w http.ResponseWriter, data interface{}, meta *Meta) {
	writeJSON(w, http.StatusOK, Response{Data: data, Meta: meta})
}

// Error writes an error response, detecting AppError when possible.
func Error(w http.ResponseWriter, err error) {
	if appErr, ok := apperrors.IsAppError(err); ok {
		writeJSON(w, appErr.HTTPStatus, Response{
			Error: &ErrorDetail{
				Code:    appErr.Code,
				Message: appErr.Message,
				Details: appErr.Details,
			},
		})
		return
	}

	writeJSON(w, http.StatusInternalServerError, Response{
		Error: &ErrorDetail{
			Code:    apperrors.ErrCodeInternal,
			Message: "Internal server error",
		},
	})
}

// ErrorWithStatus writes an error response with explicit status, code, and message.
func ErrorWithStatus(w http.ResponseWriter, statusCode int, code, message string) {
	writeJSON(w, statusCode, Response{
		Error: &ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}
