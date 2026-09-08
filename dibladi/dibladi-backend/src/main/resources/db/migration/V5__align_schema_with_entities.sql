-- V5: Align MySQL schema with JPA entities

-- USERS
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- CLIENTS: link to users (1-1)
ALTER TABLE clients ADD COLUMN user_id BIGINT NULL;
ALTER TABLE clients ADD CONSTRAINT fk_client_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE clients ADD CONSTRAINT uq_client_user UNIQUE (user_id);
ALTER TABLE clients MODIFY COLUMN user_id BIGINT NOT NULL;
-- email is no longer managed by the Client entity (now lives on User)
ALTER TABLE clients MODIFY COLUMN email VARCHAR(255) NULL;
ALTER TABLE clients MODIFY COLUMN phone VARCHAR(50) NOT NULL;

-- VENDORS: rework to match Vendor entity
ALTER TABLE vendors ADD COLUMN user_id BIGINT NULL;
ALTER TABLE vendors ADD CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE vendors ADD CONSTRAINT uq_vendor_user UNIQUE (user_id);
ALTER TABLE vendors MODIFY COLUMN user_id BIGINT NOT NULL;

ALTER TABLE vendors ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN shop_name VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE vendors ADD COLUMN shop_address TEXT NULL;
ALTER TABLE vendors ADD COLUMN social_link VARCHAR(255) NULL;
ALTER TABLE vendors ADD COLUMN score INT NOT NULL DEFAULT 0;
ALTER TABLE vendors ADD COLUMN is_approved TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE vendors ADD COLUMN approved_at TIMESTAMP NULL;
ALTER TABLE vendors ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- old columns no longer managed by the Vendor entity (now on User/shop fields)
ALTER TABLE vendors MODIFY COLUMN name VARCHAR(150) NULL;
ALTER TABLE vendors MODIFY COLUMN email VARCHAR(255) NULL;
ALTER TABLE vendors MODIFY COLUMN address TEXT NULL;

-- ORDERS
ALTER TABLE orders ADD COLUMN commission DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_first_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_last_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_address TEXT NULL;
ALTER TABLE orders ADD COLUMN delivery_city VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_postal_code VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_phone VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- product_id/quantity are no longer managed by the Order entity (replaced by order_items)
ALTER TABLE orders MODIFY COLUMN product_id BIGINT NULL;
ALTER TABLE orders MODIFY COLUMN quantity INT NULL;

-- PRODUCTS
ALTER TABLE products ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN average_rating DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN reviews_count INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- status is no longer managed by the Product entity (replaced by is_active)
ALTER TABLE products MODIFY COLUMN status VARCHAR(50) NULL;

-- PRODUCT_IMAGES (element collection table for Product.images)
CREATE TABLE product_images (
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ORDER_ITEMS
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_item_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- VENDOR_REQUESTS
CREATE TABLE vendor_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    shop_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    shop_address TEXT NOT NULL,
    social_link VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL
) ENGINE=InnoDB;