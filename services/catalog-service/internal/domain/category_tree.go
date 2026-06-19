package domain

import (
	"sort"

	"github.com/google/uuid"
)

// BuildCategoryTree assembles a hierarchical tree from a flat category list.
// Root nodes have parent_id IS NULL; children are sorted by sort_order.
func BuildCategoryTree(categories []*Category) []*Category {
	byID := make(map[uuid.UUID]*Category, len(categories))
	for _, category := range categories {
		category.Children = nil
		byID[category.ID] = category
	}

	roots := make([]*Category, 0)
	for _, category := range categories {
		if category.ParentID == nil {
			roots = append(roots, category)
			continue
		}

		parent, ok := byID[*category.ParentID]
		if !ok {
			roots = append(roots, category)
			continue
		}
		parent.Children = append(parent.Children, category)
	}

	sortCategoriesByOrder(roots)
	for _, category := range byID {
		if len(category.Children) > 0 {
			sortCategoriesByOrder(category.Children)
		}
	}

	return roots
}

func sortCategoriesByOrder(categories []*Category) {
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].SortOrder < categories[j].SortOrder
	})
}
