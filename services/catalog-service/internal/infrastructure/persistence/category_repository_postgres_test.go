package persistence

import (
	"testing"

	"github.com/google/uuid"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildCategoryTree(t *testing.T) {
	rootID := uuid.New()
	childAID := uuid.New()
	childBID := uuid.New()
	grandchildID := uuid.New()

	categories := []*domain.Category{
		{ID: rootID, Name: "Root", SortOrder: 1},
		{ID: childBID, ParentID: &rootID, Name: "Child B", SortOrder: 2},
		{ID: childAID, ParentID: &rootID, Name: "Child A", SortOrder: 1},
		{ID: grandchildID, ParentID: &childAID, Name: "Grandchild", SortOrder: 1},
	}

	roots := buildCategoryTree(categories)
	require.Len(t, roots, 1)
	assert.Equal(t, rootID, roots[0].ID)
	require.Len(t, roots[0].Children, 2)
	assert.Equal(t, childAID, roots[0].Children[0].ID)
	assert.Equal(t, childBID, roots[0].Children[1].ID)
	require.Len(t, roots[0].Children[0].Children, 1)
	assert.Equal(t, grandchildID, roots[0].Children[0].Children[0].ID)
}
