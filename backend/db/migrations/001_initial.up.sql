-- Managers table
CREATE TABLE IF NOT EXISTS managers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('try-on', 'purchase')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    device_id VARCHAR(255),
    assigned_to BIGINT REFERENCES managers(id),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_read ON orders(read);

-- Seed data

-- admin@store.local / admin123
-- bcrypt hash of "admin123"
INSERT INTO managers (email, password_hash, name) VALUES
    ('admin@store.local', '$2a$10$hvGsK2fyoL/AvVzMVM9WDe9JfIM7PWo.Ie3y.6ILOl1nqdmITlpJe', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Sample products
INSERT INTO products (id, name, description) VALUES
    (1, 'Premium Cotton T-Shirt', 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.'),
    (2, 'Slim Fit Jeans', 'Classic slim fit jeans made from premium denim. Versatile and stylish.')
ON CONFLICT DO NOTHING;

-- Product variants
INSERT INTO product_variants (product_id, name, size, color, price, stock, sku) VALUES
    (1, 'White S', 'S', 'White', 2980, 15, 'TSHIRT-WHT-S'),
    (1, 'White M', 'M', 'White', 2980, 20, 'TSHIRT-WHT-M'),
    (1, 'White L', 'L', 'White', 2980, 10, 'TSHIRT-WHT-L'),
    (1, 'Black M', 'M', 'Black', 2980, 8, 'TSHIRT-BLK-M'),
    (1, 'Black L', 'L', 'Black', 2980, 5, 'TSHIRT-BLK-L'),
    (2, 'Indigo 30', '30', 'Indigo', 7980, 12, 'JEANS-IND-30'),
    (2, 'Indigo 32', '32', 'Indigo', 7980, 18, 'JEANS-IND-32'),
    (2, 'Indigo 34', '34', 'Indigo', 7980, 7, 'JEANS-IND-34'),
    (2, 'Black 32', '32', 'Black', 7980, 10, 'JEANS-BLK-32'),
    (2, 'Black 34', '34', 'Black', 7980, 3, 'JEANS-BLK-34')
ON CONFLICT (sku) DO NOTHING;

-- Product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES
    (1, '/images/tshirt-white-front.jpg', 'White T-Shirt Front', 0),
    (1, '/images/tshirt-white-back.jpg', 'White T-Shirt Back', 1),
    (1, '/images/tshirt-black-front.jpg', 'Black T-Shirt Front', 2),
    (2, '/images/jeans-indigo-front.jpg', 'Indigo Jeans Front', 0),
    (2, '/images/jeans-indigo-back.jpg', 'Indigo Jeans Back', 1),
    (2, '/images/jeans-black-front.jpg', 'Black Jeans Front', 2)
ON CONFLICT DO NOTHING;
