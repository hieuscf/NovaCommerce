DROP TABLE IF EXISTS variant_attribute_values CASCADE;

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;

DROP TABLE IF EXISTS product_variants CASCADE;
