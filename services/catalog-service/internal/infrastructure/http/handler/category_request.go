package handler

// CreateCategoryRequest is the HTTP payload for creating a category.
type CreateCategoryRequest struct {
	Name        string  `json:"name" validate:"required,min=1,max=255"`
	ParentID    *string `json:"parent_id" validate:"omitempty,uuid4"`
	Description string  `json:"description" validate:"max=5000"`
	ImageURL    string  `json:"image_url" validate:"omitempty,max=2048"`
	SortOrder   int     `json:"sort_order"`
}

// UpdateCategoryRequest is the HTTP payload for updating a category.
type UpdateCategoryRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=1,max=255"`
	ParentID    *string `json:"parent_id" validate:"omitempty,uuid4"`
	Description *string `json:"description" validate:"omitempty,max=5000"`
	ImageURL    *string `json:"image_url" validate:"omitempty,max=2048"`
	SortOrder   *int    `json:"sort_order"`
	IsActive    *bool   `json:"is_active"`
}

// CategoryProductsQuery holds pagination query params for category products.
type CategoryProductsQuery struct {
	Cursor string `form:"cursor"`
	Limit  int    `form:"limit" validate:"omitempty,min=1,max=100"`
}
