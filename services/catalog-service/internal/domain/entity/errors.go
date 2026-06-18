package entity

import "github.com/novacommerce/pkg/errors"

var (
	ErrCategoryNotFound   = errors.New("CATEGORY_NOT_FOUND", "category not found")
	ErrBrandNotFound      = errors.New("BRAND_NOT_FOUND", "brand not found")
	ErrProductNotFound    = errors.New("PRODUCT_NOT_FOUND", "product not found")
	ErrVariantNotFound    = errors.New("VARIANT_NOT_FOUND", "product variant not found")
	ErrWarehouseNotFound  = errors.New("WAREHOUSE_NOT_FOUND", "warehouse not found")
	ErrInventoryNotFound  = errors.New("INVENTORY_NOT_FOUND", "inventory record not found")
	ErrProductForbidden   = errors.New("PRODUCT_FORBIDDEN", "you do not own this product")
	ErrDuplicateSlug      = errors.New("DUPLICATE_SLUG", "slug already exists")
	ErrDuplicateSKU       = errors.New("DUPLICATE_SKU", "variant SKU already exists")
	ErrDuplicateCode      = errors.New("DUPLICATE_CODE", "warehouse code already exists")
	ErrMaxImagesExceeded  = errors.New("MAX_IMAGES_EXCEEDED", "product cannot have more than 10 images")
	ErrInsufficientStock  = errors.New("INSUFFICIENT_STOCK", "insufficient stock available")
	ErrProductNotArchivable = errors.New("PRODUCT_NOT_ARCHIVABLE", "only draft/inactive products can be archived directly; active products must be set inactive first")
)
