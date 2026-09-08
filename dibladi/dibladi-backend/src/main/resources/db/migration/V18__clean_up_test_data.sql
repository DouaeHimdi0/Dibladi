-- V18: Clean up demo data before production

-- 1. Remove demo reviews
DELETE FROM reviews 
WHERE client_id IN (
    SELECT id FROM clients WHERE user_id IN (
        SELECT id FROM users WHERE email IN (
            'sara.benali@dibladi.ma',
            'mehdi.ouazzani@dibladi.ma',
            'lina.chakir@dibladi.ma'
        )
    )
);

-- 2. Remove demo orders (cascades to deliveries and order_items)
DELETE FROM orders 
WHERE client_id IN (
    SELECT id FROM clients WHERE user_id IN (
        SELECT id FROM users WHERE email IN (
            'sara.benali@dibladi.ma',
            'mehdi.ouazzani@dibladi.ma',
            'lina.chakir@dibladi.ma'
        )
    )
);

-- 3. Remove demo products (cascades to product_images)
DELETE FROM products 
WHERE vendor_id IN (
    SELECT id FROM vendors WHERE user_id IN (
        SELECT id FROM users WHERE email IN (
            'yasmine.el.fassi@dibladi.ma',
            'hassan.souk@dibladi.ma',
            'nadia.maroc@dibladi.ma',
            'omar.artisan@dibladi.ma'
        )
    )
);

-- 4. Remove clients
DELETE FROM clients 
WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'sara.benali@dibladi.ma',
        'mehdi.ouazzani@dibladi.ma',
        'lina.chakir@dibladi.ma'
    )
);

-- 5. Remove vendors
DELETE FROM vendors 
WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'yasmine.el.fassi@dibladi.ma',
        'hassan.souk@dibladi.ma',
        'nadia.maroc@dibladi.ma',
        'omar.artisan@dibladi.ma'
    )
);

-- 6. Remove users
DELETE FROM users 
WHERE email IN (
    'yasmine.el.fassi@dibladi.ma',
    'hassan.souk@dibladi.ma',
    'nadia.maroc@dibladi.ma',
    'omar.artisan@dibladi.ma',
    'sara.benali@dibladi.ma',
    'mehdi.ouazzani@dibladi.ma',
    'lina.chakir@dibladi.ma'
);

-- 7. Remove demo vendor requests
DELETE FROM vendor_requests WHERE email = 'karim.amrani@desertrose.ma';
