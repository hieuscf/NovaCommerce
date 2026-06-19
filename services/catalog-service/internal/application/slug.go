package application

import (
	"regexp"
	"strings"
)

var slugNonAlphaNum = regexp.MustCompile(`[^a-z0-9]+`)

// generateSlug creates a URL-friendly slug from a display name.
func generateSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = slugNonAlphaNum.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
