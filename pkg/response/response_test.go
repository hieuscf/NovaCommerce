package response

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	apperrors "github.com/novacommerce/pkg/errors"
)

func decodeResponse(t *testing.T, rec *httptest.ResponseRecorder) Response {
	t.Helper()

	var resp Response
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	return resp
}

func TestSuccess(t *testing.T) {
	rec := httptest.NewRecorder()
	Success(rec, map[string]string{"id": "123"})

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	resp := decodeResponse(t, rec)
	data, ok := resp.Data.(map[string]interface{})
	if !ok || data["id"] != "123" {
		t.Fatalf("unexpected data payload: %#v", resp.Data)
	}
	if resp.Error != nil {
		t.Fatal("expected nil error field")
	}
}

func TestSuccessWithMeta(t *testing.T) {
	rec := httptest.NewRecorder()
	meta := &Meta{Limit: 20, Total: 100, HasMore: true, NextCursor: "abc"}
	SuccessWithMeta(rec, []string{"a", "b"}, meta)

	resp := decodeResponse(t, rec)
	if resp.Meta == nil || resp.Meta.Limit != 20 || !resp.Meta.HasMore {
		t.Fatalf("unexpected meta: %#v", resp.Meta)
	}
}

func TestCreated(t *testing.T) {
	rec := httptest.NewRecorder()
	Created(rec, map[string]string{"id": "new"})

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", rec.Code)
	}
}

func TestNoContent(t *testing.T) {
	rec := httptest.NewRecorder()
	NoContent(rec)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}
}

func TestJSON(t *testing.T) {
	rec := httptest.NewRecorder()
	JSON(rec, http.StatusAccepted, map[string]int{"count": 2})

	if rec.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", rec.Code)
	}
}

func TestErrorWithAppError(t *testing.T) {
	rec := httptest.NewRecorder()
	Error(rec, apperrors.NewNotFound("user not found"))

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}

	resp := decodeResponse(t, rec)
	if resp.Error == nil || resp.Error.Code != apperrors.ErrCodeNotFound {
		t.Fatalf("unexpected error payload: %#v", resp.Error)
	}
}

func TestErrorWithGenericError(t *testing.T) {
	rec := httptest.NewRecorder()
	Error(rec, errors.New("database down"))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}

	resp := decodeResponse(t, rec)
	if resp.Error == nil || resp.Error.Code != apperrors.ErrCodeInternal {
		t.Fatalf("unexpected error payload: %#v", resp.Error)
	}
}

func TestErrorWithStatus(t *testing.T) {
	rec := httptest.NewRecorder()
	ErrorWithStatus(rec, http.StatusConflict, apperrors.ErrCodeConflict, "duplicate")

	resp := decodeResponse(t, rec)
	if resp.Error == nil || resp.Error.Message != "duplicate" {
		t.Fatalf("unexpected error payload: %#v", resp.Error)
	}
}

func TestValidationErrorIncludesDetails(t *testing.T) {
	rec := httptest.NewRecorder()
	details := []map[string]string{{"field": "email", "message": "required"}}
	Error(rec, apperrors.NewValidation("Validation failed", details))

	resp := decodeResponse(t, rec)
	if resp.Error == nil || resp.Error.Details == nil {
		t.Fatal("expected validation details in error response")
	}
}
