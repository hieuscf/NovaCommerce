package entity

import (
	"time"

	"github.com/google/uuid"
)

// AttributeValue maps to the attribute_values table.
type AttributeValue struct {
	ID          uuid.UUID `db:"id" json:"id"`
	AttributeID uuid.UUID `db:"attribute_id" json:"attribute_id"`
	Value       string    `db:"value" json:"value"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}
