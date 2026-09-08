-- V9: Partner brands table for homepage BrandsBar

CREATE TABLE brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(500) NULL,
    slug VARCHAR(150) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT uq_brands_slug UNIQUE (slug)
) ENGINE=InnoDB;
