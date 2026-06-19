ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE categories
SET is_active = (status = 'active')
WHERE status IS NOT NULL;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_categories_status;
ALTER TABLE categories DROP COLUMN IF EXISTS status;

ALTER TABLE brands
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE brands
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE brands
SET is_active = (status = 'active')
WHERE status IS NOT NULL;

ALTER TABLE brands DROP CONSTRAINT IF EXISTS chk_brands_status;
ALTER TABLE brands DROP COLUMN IF EXISTS status;
