-- V4: Add missing columns required by the Category entity

ALTER TABLE categories ADD COLUMN slug VARCHAR(150) NULL;
ALTER TABLE categories ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;

UPDATE categories
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' & ', '-and-'), ' ', '-'), '''', ''))
WHERE slug IS NULL;

ALTER TABLE categories MODIFY COLUMN slug VARCHAR(150) NOT NULL;
ALTER TABLE categories ADD CONSTRAINT uq_categories_slug UNIQUE (slug);