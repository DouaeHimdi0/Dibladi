-- V11: Promotional old price + optional brand link on products

ALTER TABLE products ADD COLUMN old_price DECIMAL(12,2) NULL;
ALTER TABLE products ADD COLUMN brand_id BIGINT NULL;
ALTER TABLE products ADD CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;

-- Promotional pricing on selected demo products
UPDATE products SET old_price = 249.00, brand_id = (SELECT id FROM brands WHERE slug = 'atlas')
WHERE name = 'Huile d''Argan Pure Bio';

UPDATE products SET old_price = 429.00, brand_id = (SELECT id FROM brands WHERE slug = 'atlas')
WHERE name = 'Sac Bandoulière Cuir Tressé';

UPDATE products SET old_price = 319.00, brand_id = (SELECT id FROM brands WHERE slug = 'souk-premium')
WHERE name = 'Hammam Set Traditionnel';

UPDATE products SET old_price = 379.00, brand_id = (SELECT id FROM brands WHERE slug = 'maroc-style')
WHERE name = 'Service à Thé Marocain';

UPDATE products SET old_price = 2290.00, brand_id = (SELECT id FROM brands WHERE slug = 'berbere')
WHERE name = 'Tapis Berbère Azilal';

-- Link additional products to brands (no promo)
UPDATE products SET brand_id = (SELECT id FROM brands WHERE slug = 'souk-premium')
WHERE name IN ('Savon Beldi Traditionnel', 'Boucles d''Oreilles Filigrane');

UPDATE products SET brand_id = (SELECT id FROM brands WHERE slug = 'maroc-style')
WHERE name IN ('Rouge à Lèvres Nectar Rose', 'Tisane Menthe & Verveine', 'Lanterne Marrakech Laiton');

UPDATE products SET brand_id = (SELECT id FROM brands WHERE slug = 'artisan-co')
WHERE name IN ('Ceinture Berbère Tissée', 'Baume Musculaire Argan');
