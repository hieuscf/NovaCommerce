package entity

import "github.com/novacommerce/pkg/errors"

var (
	ErrProductNotFound      = errors.New("PRODUCT_NOT_FOUND", "product not found")
	ErrProductForbidden     = errors.New("PRODUCT_FORBIDDEN", "you do not own this product")
	ErrDuplicateSKU         = errors.New("DUPLICATE_SKU", "variant SKU already exists")
	ErrMaxImagesExceeded    = errors.New("MAX_IMAGES_EXCEEDED", "product cannot have more than 10 images")
	ErrProductNotArchivable = errors.New("PRODUCT_NOT_ARCHIVABLE", "only draft/inactive products can be archived directly; active products must be set inactive first")
)
