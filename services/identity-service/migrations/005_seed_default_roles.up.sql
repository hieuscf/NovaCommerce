-- Bcrypt password hashes below were generated offline with cost=12.
-- Plaintext passwords (development only): Admin@123456, Seller@123456, Customer@123456

-- === Part 1: Seed system roles (always runs, including production) ===

INSERT INTO roles (id, name, display_name, description, is_system) VALUES
    (gen_random_uuid(), 'customer', 'Customer', 'End user, can browse and purchase products', true),
    (gen_random_uuid(), 'seller', 'Seller', 'Merchant, can manage products and orders', true),
    (gen_random_uuid(), 'admin', 'Administrator', 'Full system access', true),
    (gen_random_uuid(), 'analyst', 'Analyst', 'Read-only access to analytics dashboards', true),
    (gen_random_uuid(), 'partner', 'Partner', 'External partner with scoped API access', true)
ON CONFLICT (name) DO NOTHING;

-- === Part 2: Seed dev accounts (development environment only) ===
-- Requires: SET app.environment = 'development' before running migrations locally.

DO $$
BEGIN
    IF current_setting('app.environment', true) = 'development' THEN
        INSERT INTO users (username, email, password_hash, full_name, status) VALUES
            (
                'admin_dev',
                'admin@novacommerce.dev',
                '$2a$12$selkVCW4pfxf/Sb7xWwXieAEbWFToTmYIhLnc6H6.L84EcIh5nHwa',
                'Nova Admin',
                'active'
            ),
            (
                'seller_dev',
                'seller@novacommerce.dev',
                '$2a$12$HjqwpTgIO26193POYPuPXOkBUDZARpxMZG3FB2jOjpB5LeSGpi0sC',
                'Nova Seller',
                'active'
            ),
            (
                'customer_dev',
                'customer@novacommerce.dev',
                '$2a$12$Ufzti82J8pbwPnB49tCQKuMrb2haZSHVXE3VxI/.mo/pE6AyMWqLS',
                'Nova Customer',
                'active'
            )
        ON CONFLICT (email) DO NOTHING;

        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u
        JOIN roles r ON r.name = 'admin'
        WHERE u.email = 'admin@novacommerce.dev'
        ON CONFLICT DO NOTHING;

        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u
        JOIN roles r ON r.name = 'seller'
        WHERE u.email = 'seller@novacommerce.dev'
        ON CONFLICT DO NOTHING;

        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u
        JOIN roles r ON r.name = 'customer'
        WHERE u.email = 'customer@novacommerce.dev'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
