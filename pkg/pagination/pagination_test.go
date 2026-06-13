package pagination

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestEncodeDecodeCursorRoundTrip(t *testing.T) {
	id := uuid.NewString()
	createdAt := time.Date(2024, 6, 14, 10, 30, 0, 0, time.UTC)

	cursor := EncodeCursor(id, createdAt)
	decodedID, decodedTime, err := DecodeCursor(cursor)
	if err != nil {
		t.Fatalf("failed to decode cursor: %v", err)
	}

	if decodedID != id {
		t.Fatalf("expected id %s, got %s", id, decodedID)
	}
	if !decodedTime.Equal(createdAt) {
		t.Fatalf("expected time %v, got %v", createdAt, decodedTime)
	}
}

func TestDecodeCursorInvalidInput(t *testing.T) {
	if _, _, err := DecodeCursor(""); err == nil {
		t.Fatal("expected empty cursor to fail")
	}

	if _, _, err := DecodeCursor("not-base64"); err == nil {
		t.Fatal("expected invalid base64 to fail")
	}

	raw := EncodeCursor("id", time.Now())
	invalid := raw[:len(raw)-2] + "xx"
	if _, _, err := DecodeCursor(invalid); err == nil {
		t.Fatal("expected invalid payload to fail")
	}
}

func TestParseParamsDefaults(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/items", nil)
	params, err := ParseParams(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if params.Limit != defaultLimit {
		t.Fatalf("expected default limit %d, got %d", defaultLimit, params.Limit)
	}
}

func TestParseParamsValidQuery(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/items?cursor=abc&limit=50", nil)
	params, err := ParseParams(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if params.Cursor != "abc" || params.Limit != 50 {
		t.Fatalf("unexpected params: %#v", params)
	}
}

func TestParseParamsInvalidLimit(t *testing.T) {
	tests := []string{"limit=abc", "limit=0", "limit=101", "limit=-1"}
	for _, query := range tests {
		req := httptest.NewRequest(http.MethodGet, "/items?"+query, nil)
		if _, err := ParseParams(req); err == nil {
			t.Fatalf("expected error for query %s", query)
		}
	}
}

func TestBuildResultHasMoreLogic(t *testing.T) {
	params := &CursorParams{Limit: 2}
	createdAt := time.Now().UTC()
	items := []string{"a", "b"}

	result := BuildResult(items, "last-id", createdAt, 10, params)
	if !result.HasMore {
		t.Fatal("expected HasMore true when item count equals limit")
	}
	if result.NextCursor == "" {
		t.Fatal("expected next cursor when HasMore is true")
	}

	shortItems := []string{"a"}
	result = BuildResult(shortItems, "last-id", createdAt, 10, params)
	if result.HasMore {
		t.Fatal("expected HasMore false when item count is below limit")
	}

	result = BuildResult(items, "", createdAt, 10, params)
	if result.HasMore {
		t.Fatal("expected HasMore false when lastID is empty")
	}
}

func TestBuildResultNilParamsUsesDefaultLimit(t *testing.T) {
	items := make([]int, defaultLimit)
	for i := range items {
		items[i] = i
	}

	result := BuildResult(items, "id", time.Now().UTC(), 100, nil)
	if !result.HasMore {
		t.Fatal("expected HasMore with default limit")
	}
}

func TestCountItemsNonSlice(t *testing.T) {
	result := BuildResult("not-a-slice", "id", time.Now().UTC(), 0, &CursorParams{Limit: 1})
	if result.HasMore {
		t.Fatal("expected HasMore false for non-slice items")
	}
}
