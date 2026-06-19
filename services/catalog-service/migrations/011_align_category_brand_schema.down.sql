ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

UPDATE categories
SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;

ALTER TABLE categories
    ADD CONSTRAINT chk_categories_status CHECK (status IN ('active', 'inactive'));

ALTER TABLE categories DROP COLUMN IF EXISTS is_active;
ALTER TABLE categories DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE brands
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

UPDATE brands
SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;

ALTER TABLE brands
    ADD CONSTRAINT chk_brands_status CHECK (status IN ('active', 'inactive'));

ALTER TABLE brands DROP COLUMN IF EXISTS is_active;
ALTER TABLE brands DROP COLUMN IF EXISTS deleted_at;
