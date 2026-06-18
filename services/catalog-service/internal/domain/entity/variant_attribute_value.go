package entity

import (
	"github.com/google/uuid"
)

// VariantAttributeValue maps to the variant_attribute_values junction table.
type VariantAttributeValue struct {
	ID               uuid.UUID `db:"id" json:"id"`
	VariantID        uuid.UUID `db:"variant_id" json:"variant_id"`
	AttributeValueID uuid.UUID `db:"attribute_value_id" json:"attribute_value_id"`
}
