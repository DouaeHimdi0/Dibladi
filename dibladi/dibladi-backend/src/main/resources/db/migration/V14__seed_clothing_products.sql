-- V14: Seed clothing products across new categories

INSERT INTO products (name, description, price, old_price, stock_quantity, vendor_id, category_id, brand_id, is_active, average_rating, reviews_count) VALUES
    ('Robe Djellaba Brodée', 'Robe djellaba légère en coton brodé main, coupe fluide et confortable.', 459.00, 549.00, 18,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'robes' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'zara' LIMIT 1), 1, 4.6, 12),
    ('Robe Caftan Soie', 'Caftan en soie naturelle avec finitions dorées, idéal pour les cérémonies.', 890.00, NULL, 10,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'robes' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'atlas-wear' LIMIT 1), 1, 4.8, 8),
    ('Jean Slim Fit Indigo', 'Jean coupe slim en denim stretch, teinte indigo profonde.', 329.00, 399.00, 35,
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'jeans' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'adidas' LIMIT 1), 1, 4.4, 21),
    ('Jean Délavé Street', 'Jean droit délavé, style casual pour un look quotidien.', 279.00, NULL, 28,
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'jeans' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'nike' LIMIT 1), 1, 4.2, 15),
    ('T-shirt Coton Bio', 'T-shirt 100% coton bio, coupe regular, disponible en plusieurs coloris.', 89.00, 119.00, 60,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 't-shirts' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'marktack' LIMIT 1), 1, 4.5, 33),
    ('T-shirt Oversize Print', 'T-shirt oversize avec imprimé graphique inspiré des motifs marocains.', 99.00, NULL, 42,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 't-shirts' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'lc-waikiki' LIMIT 1), 1, 4.1, 9),
    ('Veste Saharienne Légère', 'Veste saharienne en lin, parfaite pour la mi-saison.', 549.00, 649.00, 14,
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'vestes' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'mango' LIMIT 1), 1, 4.7, 6),
    ('Basket Cuir Premium', 'Basket en cuir véritable, semelle confort antidérapante.', 699.00, 849.00, 22,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'chaussures' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'nike' LIMIT 1), 1, 4.6, 18),
    ('Babouches Brodées', 'Babouches traditionnelles brodées à la main, confortables et élégantes.', 199.00, NULL, 30,
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'chaussures' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'souk-style' LIMIT 1), 1, 4.9, 24),
    ('Sac Bandoulière Urban', 'Sac bandoulière compact en cuir synthétique, multiple poches.', 249.00, 299.00, 25,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style' LIMIT 1),
        (SELECT id FROM categories WHERE slug = 'sacs' LIMIT 1),
        (SELECT id FROM brands WHERE slug = 'zara' LIMIT 1), 1, 4.3, 11);

INSERT INTO product_images (product_id, image_url)
SELECT id, CONCAT('https://picsum.photos/seed/dibladi-clothing-', id, '/400/500')
FROM products
WHERE name IN (
    'Robe Djellaba Brodée',
    'Robe Caftan Soie',
    'Jean Slim Fit Indigo',
    'Jean Délavé Street',
    'T-shirt Coton Bio',
    'T-shirt Oversize Print',
    'Veste Saharienne Légère',
    'Basket Cuir Premium',
    'Babouches Brodées',
    'Sac Bandoulière Urban'
);
