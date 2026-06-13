package pagination

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"reflect"
	"strconv"
	"time"
)

const (
	defaultLimit = 20
	minLimit     = 1
	maxLimit     = 100
)

// CursorParams holds cursor pagination query parameters.
type CursorParams struct {
	Cursor string `json:"cursor" form:"cursor"`
	Limit  int    `json:"limit" form:"limit" validate:"min=1,max=100"`
}

type cursorPayload struct {
	ID        string `json:"id"`
	CreatedAt string `json:"created_at"`
}

// ParseParams parses cursor pagination params from an HTTP request query string.
func ParseParams(r *http.Request) (*CursorParams, error) {
	query := r.URL.Query()
	params := &CursorParams{
		Cursor: query.Get("cursor"),
		Limit:  defaultLimit,
	}

	if limitValue := query.Get("limit"); limitValue != "" {
		limit, err := strconv.Atoi(limitValue)
		if err != nil {
			return nil, fmt.Errorf("invalid limit: %w", err)
		}
		params.Limit = limit
	}

	if params.Limit < minLimit || params.Limit > maxLimit {
		return nil, fmt.Errorf("limit must be between %d and %d", minLimit, maxLimit)
	}

	return params, nil
}

// EncodeCursor encodes an entity cursor as base64 JSON.
func EncodeCursor(id string, createdAt time.Time) string {
	payload := cursorPayload{
		ID:        id,
		CreatedAt: createdAt.UTC().Format(time.RFC3339),
	}

	raw, err := json.Marshal(payload)
	if err != nil {
		return ""
	}

	return base64.StdEncoding.EncodeToString(raw)
}

// DecodeCursor decodes a base64 JSON cursor.
func DecodeCursor(cursor string) (string, time.Time, error) {
	if cursor == "" {
		return "", time.Time{}, fmt.Errorf("cursor is empty")
	}

	raw, err := base64.StdEncoding.DecodeString(cursor)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("invalid cursor encoding: %w", err)
	}

	var payload cursorPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return "", time.Time{}, fmt.Errorf("invalid cursor payload: %w", err)
	}

	createdAt, err := time.Parse(time.RFC3339, payload.CreatedAt)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("invalid cursor timestamp: %w", err)
	}

	return payload.ID, createdAt, nil
}

// BuildResult constructs a cursor pagination result with next-page metadata.
func BuildResult(items interface{}, lastID string, lastCreatedAt time.Time, total int64, params *CursorParams) *CursorResult {
	if params == nil {
		params = &CursorParams{Limit: defaultLimit}
	}

	itemCount := countItems(items)
	hasMore := itemCount >= params.Limit && lastID != ""

	result := &CursorResult{
		Items:   items,
		Total:   total,
		HasMore: hasMore,
	}

	if hasMore {
		result.NextCursor = EncodeCursor(lastID, lastCreatedAt)
	}

	return result
}

func countItems(items interface{}) int {
	if items == nil {
		return 0
	}

	value := reflect.ValueOf(items)
	switch value.Kind() {
	case reflect.Slice, reflect.Array:
		return value.Len()
	default:
		return 0
	}
}

// CursorResult is the cursor pagination response payload.
type CursorResult struct {
	Items      interface{} `json:"items"`
	NextCursor string      `json:"next_cursor,omitempty"`
	HasMore    bool        `json:"has_more"`
	Total      int64       `json:"total,omitempty"`
}

// MustParseParams parses query params from a raw query string, panicking on invalid input.
// Useful for tests.
func MustParseParams(query string) *CursorParams {
	req := &http.Request{URL: &url.URL{RawQuery: query}}
	params, err := ParseParams(req)
	if err != nil {
		panic(err)
	}
	return params
}
