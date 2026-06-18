package entity

// CategoryStatus is the lifecycle state of a category.
type CategoryStatus string

const (
	CategoryStatusActive   CategoryStatus = "active"
	CategoryStatusInactive CategoryStatus = "inactive"
)

// BrandStatus is the lifecycle state of a brand.
type BrandStatus string

const (
	BrandStatusActive   BrandStatus = "active"
	BrandStatusInactive BrandStatus = "inactive"
)

// ProductStatus is the lifecycle state of a product.
type ProductStatus string

const (
	ProductStatusDraft    ProductStatus = "draft"
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
	ProductStatusArchived ProductStatus = "archived"
)

// AttributeType describes the kind of product attribute.
type AttributeType string

const (
	AttributeTypeText   AttributeType = "text"
	AttributeTypeNumber AttributeType = "number"
	AttributeTypeColor  AttributeType = "color"
	AttributeTypeSize   AttributeType = "size"
)
