-- V12: Switch brands from logo images to typographic font_style

SET @add_font_style = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'brands' AND COLUMN_NAME = 'font_style') = 0,
    'ALTER TABLE brands ADD COLUMN font_style VARCHAR(50) NOT NULL DEFAULT ''sans-bold'' AFTER slug',
    'SELECT 1'
);
PREPARE add_font_style_stmt FROM @add_font_style;
EXECUTE add_font_style_stmt;
DEALLOCATE PREPARE add_font_style_stmt;

UPDATE brands SET logo_url = NULL;

UPDATE brands SET slug = CONCAT('tmp-brand-', id);

UPDATE brands SET name = 'Zara', slug = 'zara', font_style = 'condensed-upper' WHERE id = 1;
UPDATE brands SET name = 'LC Waikiki', slug = 'lc-waikiki', font_style = 'sans-bold' WHERE id = 2;
UPDATE brands SET name = 'Adidas', slug = 'adidas', font_style = 'condensed-upper' WHERE id = 3;
UPDATE brands SET name = 'Nike', slug = 'nike', font_style = 'sans-bold' WHERE id = 4;
UPDATE brands SET name = 'Marktack', slug = 'marktack', font_style = 'condensed-upper' WHERE id = 5;
UPDATE brands SET name = 'Atlas Wear', slug = 'atlas-wear', font_style = 'serif-italic' WHERE id = 6;
UPDATE brands SET name = 'Souk Style', slug = 'souk-style', font_style = 'script' WHERE id = 7;
UPDATE brands SET name = 'Mango', slug = 'mango', font_style = 'serif-italic' WHERE id = 8;
