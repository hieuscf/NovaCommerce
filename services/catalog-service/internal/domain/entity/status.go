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
	ProductStatusArchived ProductStatus = "archived"
)

// ProductVariantStatus is the lifecycle state of a product variant.
type ProductVariantStatus string

const (
	ProductVariantStatusDraft    ProductVariantStatus = "draft"
	ProductVariantStatusActive   ProductVariantStatus = "active"
	ProductVariantStatusInactive ProductVariantStatus = "inactive"
	ProductVariantStatusArchived ProductVariantStatus = "archived"
)

// AttributeType describes the kind of product attribute.
type AttributeType string

const (
	AttributeTypeText   AttributeType = "text"
	AttributeTypeNumber AttributeType = "number"
	AttributeTypeColor  AttributeType = "color"
	AttributeTypeSize   AttributeType = "size"
)
