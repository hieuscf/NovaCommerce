CREATE TABLE attributes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_attributes_type CHECK (type IN ('text', 'number', 'color', 'size'))
);

CREATE TRIGGER trg_attributes_updated_at
    BEFORE UPDATE ON attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE attribute_values (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES attributes (id) ON DELETE CASCADE,
    value        VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
