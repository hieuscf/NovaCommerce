package entity

import "github.com/google/uuid"

// VariantAttribute is an eager-loaded attribute value for a product variant.
type VariantAttribute struct {
	AttributeID   uuid.UUID `json:"attribute_id"`
	AttributeName string    `json:"attribute_name"`
	ValueID       uuid.UUID `json:"value_id"`
	Value         string    `json:"value"`
}
