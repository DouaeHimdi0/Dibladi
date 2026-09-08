-- V6: Realistic demo data for DiblaDi marketplace (linked FKs, JPA-aligned columns)

SET @demo_password = '$2a$10$5Gq1Tt7EzVO2A4zB9svxF.gqtMwB6tyzJ7oKZfT6q.R9aLsr1SR9a';

-- ---------------------------------------------------------------------------
-- Vendors (users + vendors)
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password, role, first_name, last_name) VALUES
    ('yasmine.el.fassi@dibladi.ma', @demo_password, 'VENDOR', 'Yasmine', 'El Fassi'),
    ('hassan.souk@dibladi.ma', @demo_password, 'VENDOR', 'Hassan', 'Alaoui'),
    ('nadia.maroc@dibladi.ma', @demo_password, 'VENDOR', 'Nadia', 'Bennani'),
    ('omar.artisan@dibladi.ma', @demo_password, 'VENDOR', 'Omar', 'Tazi');

INSERT INTO vendors (user_id, first_name, last_name, phone, shop_name, city, shop_address, social_link, score, is_approved, approved_at) VALUES
    ((SELECT id FROM users WHERE email = 'yasmine.el.fassi@dibladi.ma'), 'Yasmine', 'El Fassi', '0612345678', 'Atlas Boutique', 'Casablanca', '12 Boulevard Zerktouni, Casablanca', 'https://instagram.com/atlas.boutique', 92, 1, NOW()),
    ((SELECT id FROM users WHERE email = 'hassan.souk@dibladi.ma'), 'Hassan', 'Alaoui', '0623456789', 'Souk Premium', 'Marrakech', '45 Derb Sidi Bouloukat, Médina', 'https://instagram.com/souk.premium', 88, 1, NOW()),
    ((SELECT id FROM users WHERE email = 'nadia.maroc@dibladi.ma'), 'Nadia', 'Bennani', '0634567890', 'Maroc Style', 'Rabat', '8 Avenue Mohammed V, Rabat', 'https://instagram.com/maroc.style', 95, 1, NOW()),
    ((SELECT id FROM users WHERE email = 'omar.artisan@dibladi.ma'), 'Omar', 'Tazi', '0645678901', 'Artisan Co', 'Fès', '3 Rue Talaa Kebira, Fès', 'https://instagram.com/artisan.co', 90, 1, NOW());

-- ---------------------------------------------------------------------------
-- Clients (users + clients)
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password, role, first_name, last_name) VALUES
    ('sara.benali@dibladi.ma', @demo_password, 'CLIENT', 'Sara', 'Benali'),
    ('mehdi.ouazzani@dibladi.ma', @demo_password, 'CLIENT', 'Mehdi', 'Ouazzani'),
    ('lina.chakir@dibladi.ma', @demo_password, 'CLIENT', 'Lina', 'Chakir');

INSERT INTO clients (user_id, first_name, last_name, phone) VALUES
    ((SELECT id FROM users WHERE email = 'sara.benali@dibladi.ma'), 'Sara', 'Benali', '0678901234'),
    ((SELECT id FROM users WHERE email = 'mehdi.ouazzani@dibladi.ma'), 'Mehdi', 'Ouazzani', '0689012345'),
    ((SELECT id FROM users WHERE email = 'lina.chakir@dibladi.ma'), 'Lina', 'Chakir', '0690123456');

-- ---------------------------------------------------------------------------
-- Products (12 across 4 categories)
-- category_id: 1=Cosmetics, 2=Accessories, 3=Wellness, 4=Home & Lifestyle
-- ---------------------------------------------------------------------------
INSERT INTO products (name, description, price, stock_quantity, vendor_id, category_id, is_active, average_rating, reviews_count) VALUES
    ('Huile d''Argan Pure Bio', 'Huile d''argan 100% biologique pressée à froid, idéale pour le visage et les cheveux.', 189.00, 45,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 1, 1, 4.8, 1),
    ('Savon Beldi Traditionnel', 'Savon noir beldi enrichi à l''eucalyptus, préparation artisanale pour le hammam.', 45.00, 120,
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium'), 1, 1, 0.0, 0),
    ('Rouge à Lèvres Nectar Rose', 'Rouge à lèvres longue tenue aux pigments naturels, fini satiné rose nude.', 129.00, 30,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 1, 1, 0.0, 0),

    ('Sac Bandoulière Cuir Tressé', 'Sac bandoulière en cuir marocain tressé à la main, bandoulière ajustable.', 349.00, 18,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 2, 1, 4.5, 1),
    ('Ceinture Berbère Tissée', 'Ceinture traditionnelle tissée avec motifs berbères authentiques.', 159.00, 25,
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co'), 2, 1, 0.0, 0),
    ('Boucles d''Oreilles Filigrane', 'Boucles d''oreilles en argent filigrane, artisanat de Tiznit.', 219.00, 14,
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium'), 2, 1, 0.0, 0),

    ('Tisane Menthe & Verveine', 'Mélange de menthe du Rif et verveine pour une infusion apaisante.', 39.00, 80,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 3, 1, 4.2, 1),
    ('Hammam Set Traditionnel', 'Kit hammam complet : gant kessa, savon beldi et huile d''argan.', 249.00, 22,
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium'), 3, 1, 0.0, 0),
    ('Baume Musculaire Argan', 'Baume réconfortant aux huiles essentielles et beurre d''argan.', 89.00, 40,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 3, 1, 0.0, 0),

    ('Tapis Berbère Azilal', 'Tapis berbère Azilal tissé main, laine naturelle et motifs géométriques.', 1890.00, 5,
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co'), 4, 1, 5.0, 1),
    ('Lanterne Marrakech Laiton', 'Lanterne marocaine en laiton ajouré, parfaite pour une ambiance chaleureuse.', 459.00, 12,
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 4, 1, 0.0, 0),
    ('Service à Thé Marocain', 'Service à thé complet : théière, plateau et 6 verres à motif traditionnel.', 299.00, 20,
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 4, 1, 0.0, 0);

-- Product images (placeholder URLs)
INSERT INTO product_images (product_id, image_url)
SELECT id, CONCAT('https://picsum.photos/seed/dibladi-prod-', id, '/400/500') FROM products;

-- ---------------------------------------------------------------------------
-- Orders + order_items (5% commission)
-- ---------------------------------------------------------------------------
INSERT INTO orders (order_number, client_id, status, total_amount, commission, delivery_first_name, delivery_last_name, delivery_address, delivery_city, delivery_postal_code, delivery_phone) VALUES
    ('DBL-2026-0001',
        (SELECT id FROM clients WHERE first_name = 'Sara' AND last_name = 'Benali'),
        'CONFIRMED', 538.00, 26.90, 'Sara', 'Benali', '15 Rue des Fleurs, Agdal', 'Rabat', '10000', '0678901234'),
    ('DBL-2026-0002',
        (SELECT id FROM clients WHERE first_name = 'Mehdi' AND last_name = 'Ouazzani'),
        'DELIVERED', 349.00, 17.45, 'Mehdi', 'Ouazzani', '22 Avenue Hassan II', 'Casablanca', '20000', '0689012345'),
    ('DBL-2026-0003',
        (SELECT id FROM clients WHERE first_name = 'Sara' AND last_name = 'Benali'),
        'SHIPPED', 288.00, 14.40, 'Sara', 'Benali', '15 Rue des Fleurs, Agdal', 'Rabat', '10000', '0678901234'),
    ('DBL-2026-0004',
        (SELECT id FROM clients WHERE first_name = 'Lina' AND last_name = 'Chakir'),
        'PENDING', 1890.00, 94.50, 'Lina', 'Chakir', '7 Quartier Gueliz', 'Marrakech', '40000', '0690123456'),
    ('DBL-2026-0005',
        (SELECT id FROM clients WHERE first_name = 'Mehdi' AND last_name = 'Ouazzani'),
        'DELIVERED', 428.00, 21.40, 'Mehdi', 'Ouazzani', '22 Avenue Hassan II', 'Casablanca', '20000', '0689012345'),
    ('DBL-2026-0006',
        (SELECT id FROM clients WHERE first_name = 'Lina' AND last_name = 'Chakir'),
        'CANCELLED', 129.00, 6.45, 'Lina', 'Chakir', '7 Quartier Gueliz', 'Marrakech', '40000', '0690123456');

INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price, total_price) VALUES
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0001'),
        (SELECT id FROM products WHERE name = 'Huile d''Argan Pure Bio'),
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 1, 189.00, 189.00),
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0001'),
        (SELECT id FROM products WHERE name = 'Sac Bandoulière Cuir Tressé'),
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 1, 349.00, 349.00),

    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0002'),
        (SELECT id FROM products WHERE name = 'Sac Bandoulière Cuir Tressé'),
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 1, 349.00, 349.00),

    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0003'),
        (SELECT id FROM products WHERE name = 'Tisane Menthe & Verveine'),
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 2, 39.00, 78.00),
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0003'),
        (SELECT id FROM products WHERE name = 'Baume Musculaire Argan'),
        (SELECT id FROM vendors WHERE shop_name = 'Atlas Boutique'), 2, 89.00, 178.00),
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0003'),
        (SELECT id FROM products WHERE name = 'Savon Beldi Traditionnel'),
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium'), 1, 45.00, 45.00),

    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0004'),
        (SELECT id FROM products WHERE name = 'Tapis Berbère Azilal'),
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co'), 1, 1890.00, 1890.00),

    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0005'),
        (SELECT id FROM products WHERE name = 'Hammam Set Traditionnel'),
        (SELECT id FROM vendors WHERE shop_name = 'Souk Premium'), 1, 249.00, 249.00),
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0005'),
        (SELECT id FROM products WHERE name = 'Ceinture Berbère Tissée'),
        (SELECT id FROM vendors WHERE shop_name = 'Artisan Co'), 1, 159.00, 159.00),
    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0005'),
        (SELECT id FROM products WHERE name = 'Tisane Menthe & Verveine'),
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 1, 39.00, 39.00),

    ((SELECT id FROM orders WHERE order_number = 'DBL-2026-0006'),
        (SELECT id FROM products WHERE name = 'Rouge à Lèvres Nectar Rose'),
        (SELECT id FROM vendors WHERE shop_name = 'Maroc Style'), 1, 129.00, 129.00);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
INSERT INTO reviews (product_id, client_id, rating, comment) VALUES
    ((SELECT id FROM products WHERE name = 'Huile d''Argan Pure Bio'),
        (SELECT id FROM clients WHERE first_name = 'Sara' AND last_name = 'Benali'),
        5, 'Texture légère, parfum naturel. Ma peau est plus douce après une semaine.'),
    ((SELECT id FROM products WHERE name = 'Sac Bandoulière Cuir Tressé'),
        (SELECT id FROM clients WHERE first_name = 'Mehdi' AND last_name = 'Ouazzani'),
        4, 'Très beau travail artisanal, cuir de qualité. Livraison rapide.'),
    ((SELECT id FROM products WHERE name = 'Tapis Berbère Azilal'),
        (SELECT id FROM clients WHERE first_name = 'Lina' AND last_name = 'Chakir'),
        5, 'Magnifique tapis, les couleurs sont encore plus belles en vrai.'),
    ((SELECT id FROM products WHERE name = 'Tisane Menthe & Verveine'),
        (SELECT id FROM clients WHERE first_name = 'Sara' AND last_name = 'Benali'),
        4, 'Goût frais et parfumé, parfait après le repas du soir.');

-- ---------------------------------------------------------------------------
-- Deliveries (linked to delivered / in-progress orders)
-- ---------------------------------------------------------------------------
INSERT INTO deliveries (delivery_number, order_id, vendor_address, vendor_city, client_address, client_city, client_name, status, order_amount, delivered_at) VALUES
    ('LIV-2026-0001',
        (SELECT id FROM orders WHERE order_number = 'DBL-2026-0002'),
        '12 Boulevard Zerktouni, Casablanca', 'Casablanca',
        '22 Avenue Hassan II', 'Casablanca', 'Mehdi Ouazzani',
        'DELIVERED', 349.00, NOW()),
    ('LIV-2026-0002',
        (SELECT id FROM orders WHERE order_number = 'DBL-2026-0003'),
        '8 Avenue Mohammed V, Rabat', 'Rabat',
        '15 Rue des Fleurs, Agdal', 'Rabat', 'Sara Benali',
        'IN_PROGRESS', 288.00, NULL),
    ('LIV-2026-0003',
        (SELECT id FROM orders WHERE order_number = 'DBL-2026-0005'),
        '45 Derb Sidi Bouloukat, Médina', 'Marrakech',
        '22 Avenue Hassan II', 'Casablanca', 'Mehdi Ouazzani',
        'DELIVERED', 428.00, NOW());

-- ---------------------------------------------------------------------------
-- Pending vendor request (admin validation flow)
-- ---------------------------------------------------------------------------
INSERT INTO vendor_requests (first_name, last_name, email, phone, shop_name, city, shop_address, social_link, status) VALUES
    ('Karim', 'Amrani', 'karim.amrani@desertrose.ma', '0656789012', 'Desert Rose Atelier', 'Tanger',
        '18 Boulevard Pasteur, Tanger', 'https://instagram.com/desert.rose.atelier', 'PENDING');
