-- V13: Add image_url to categories and seed clothing categories

ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL;

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=180&h=180&q=80' WHERE slug = 'cosmetics';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=180&h=180&q=80' WHERE slug = 'accessories';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=180&h=180&q=80' WHERE slug = 'wellness';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=180&h=180&q=80' WHERE slug = 'home-and-lifestyle';

INSERT INTO categories (name, slug, is_active, image_url) VALUES
    ('Robes', 'robes', 1, 'https://images.unsplash.com/photo-1595777457583-95e059ee6b8b?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Jeans', 'jeans', 1, 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=180&h=180&q=80'),
    ('T-shirts', 't-shirts', 1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Vestes', 'vestes', 1, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Chaussures', 'chaussures', 1, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Accessoires', 'accessoires', 1, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Bijoux', 'bijoux', 1, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Sacs', 'sacs', 1, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=180&h=180&q=80'),
    ('Artisanat', 'artisanat', 1, 'https://images.unsplash.com/photo-1605218457223-451556c0f0c0?auto=format&fit=crop&w=180&h=180&q=80');
