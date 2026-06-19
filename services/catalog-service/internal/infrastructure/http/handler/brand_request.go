package handler

// CreateBrandRequest is the HTTP payload for creating a brand.
type CreateBrandRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"max=5000"`
	LogoURL     string `json:"logo_url" validate:"omitempty,max=2048"`
}

// UpdateBrandRequest is the HTTP payload for updating a brand.
type UpdateBrandRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=1,max=255"`
	Description *string `json:"description" validate:"omitempty,max=5000"`
	LogoURL     *string `json:"logo_url" validate:"omitempty,max=2048"`
	IsActive    *bool   `json:"is_active"`
}
