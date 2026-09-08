ALTER TABLE products ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 30.00;
UPDATE products SET delivery_fee = 30.00 WHERE delivery_fee IS NULL;
