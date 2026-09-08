-- V22: Add parent categories and link the existing category catalog.

CREATE TABLE parent_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE categories
    ADD COLUMN parent_category_id BIGINT NULL,
    ADD COLUMN display_order INT DEFAULT 0,
    ADD CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_category_id)
        REFERENCES parent_categories(id)
        ON DELETE SET NULL;

INSERT INTO parent_categories (name, slug, display_order) VALUES
    ('Beauté & Bien-être', 'beaute-bien-etre', 1),
    ('Chaussures', 'chaussures', 2),
    ('Mode & Vêtements', 'mode-vetements', 3),
    ('Bijoux, Sacs & Accessoires', 'bijoux-sacs-accessoires', 4),
    ('Artisanat & Terroir Marocain', 'artisanat-terroir', 5),
    ('Maison & Lifestyle', 'maison-lifestyle', 6);

INSERT INTO categories (name, slug, parent_category_id, is_active, display_order)
SELECT v.name, v.slug, p.id, TRUE, v.display_order
FROM (
    SELECT 'Produits Naturels & Terroir' name, 'produits-naturels-terroir' slug, 'beaute-bien-etre' parent_slug, 1 display_order UNION ALL
    SELECT 'Soins Visage & Corps', 'soins-visage-corps', 'beaute-bien-etre', 2 UNION ALL
    SELECT 'Soins Cheveux', 'soins-cheveux', 'beaute-bien-etre', 3 UNION ALL
    SELECT 'Maquillage', 'maquillage', 'beaute-bien-etre', 4 UNION ALL
    SELECT 'Parfumerie', 'parfumerie', 'beaute-bien-etre', 5 UNION ALL
    SELECT 'Compléments Alimentaires', 'complements-alimentaires', 'beaute-bien-etre', 6 UNION ALL
    SELECT 'Babouches Traditionnelles', 'babouches-traditionnelles', 'chaussures', 1 UNION ALL
    SELECT 'Chaussures de Ville', 'chaussures-de-ville', 'chaussures', 2 UNION ALL
    SELECT 'Sandales & Mules', 'sandales-mules', 'chaussures', 3 UNION ALL
    SELECT 'Chaussures de Sport', 'chaussures-sport', 'chaussures', 4 UNION ALL
    SELECT 'Vêtements Femme', 'vetements-femme', 'mode-vetements', 1 UNION ALL
    SELECT 'Vêtements Homme', 'vetements-homme', 'mode-vetements', 2 UNION ALL
    SELECT 'Vêtements Enfant', 'vetements-enfant', 'mode-vetements', 3 UNION ALL
    SELECT 'Vêtements de Sport', 'vetements-sport', 'mode-vetements', 4 UNION ALL
    SELECT 'Tenues Traditionnelles', 'tenues-traditionnelles', 'mode-vetements', 5 UNION ALL
    SELECT 'Bijoux Traditionnels', 'bijoux-traditionnels', 'bijoux-sacs-accessoires', 1 UNION ALL
    SELECT 'Bijoux Modernes', 'bijoux-modernes', 'bijoux-sacs-accessoires', 2 UNION ALL
    SELECT 'Sacs & Maroquinerie', 'sacs-maroquinerie', 'bijoux-sacs-accessoires', 3 UNION ALL
    SELECT 'Accessoires de Mode', 'accessoires-mode', 'bijoux-sacs-accessoires', 4 UNION ALL
    SELECT 'Épicerie & Terroir', 'epicerie-terroir', 'artisanat-terroir', 1 UNION ALL
    SELECT 'Poterie & Céramique', 'poterie-ceramique', 'artisanat-terroir', 2 UNION ALL
    SELECT 'Tapis Marocains', 'tapis-marocains', 'artisanat-terroir', 3 UNION ALL
    SELECT 'Décoration Artisanale', 'decoration-artisanale', 'artisanat-terroir', 4 UNION ALL
    SELECT 'Linge de Maison', 'linge-maison', 'maison-lifestyle', 1 UNION ALL
    SELECT 'Vaisselle & Cuisine', 'vaisselle-cuisine', 'maison-lifestyle', 2 UNION ALL
    SELECT 'Décoration & Vases', 'decoration-vases', 'maison-lifestyle', 3 UNION ALL
    SELECT 'Rangement & Organisation', 'rangement-organisation', 'maison-lifestyle', 4 UNION ALL
    SELECT 'Matériel & Accessoires de Sport', 'materiel-sport', 'maison-lifestyle', 5
) v
JOIN parent_categories p ON p.slug = v.parent_slug
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.slug = v.slug);
