-- V24: Define category-specific product attributes.

CREATE TABLE category_attributes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    attribute_key VARCHAR(100) NOT NULL,
    attribute_label VARCHAR(200) NOT NULL,
    attribute_type ENUM('text', 'select', 'number') NOT NULL DEFAULT 'text',
    placeholder_hint VARCHAR(300),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT DEFAULT 0,
    CONSTRAINT fk_attr_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO category_attributes (category_id, attribute_key, attribute_label, attribute_type, placeholder_hint, is_required, display_order)
SELECT c.id, a.attribute_key, a.attribute_label, a.attribute_type, a.placeholder_hint, TRUE, a.display_order
FROM categories c
JOIN (
    SELECT 'produits-naturels-terroir' slug, 'contenance' attribute_key, 'Contenance' attribute_label, 'number' attribute_type, 'ex: 150' placeholder_hint, 1 display_order UNION ALL
    SELECT 'produits-naturels-terroir', 'unite', 'Unité', 'select', 'ml ou g', 2 UNION ALL
    SELECT 'soins-visage-corps', 'contenance', 'Contenance', 'number', 'ex: 150', 1 UNION ALL
    SELECT 'soins-visage-corps', 'unite', 'Unité', 'select', 'ml ou g', 2 UNION ALL
    SELECT 'soins-cheveux', 'contenance', 'Contenance', 'number', 'ex: 150', 1 UNION ALL
    SELECT 'soins-cheveux', 'unite', 'Unité', 'select', 'ml ou g', 2 UNION ALL
    SELECT 'parfumerie', 'contenance', 'Contenance', 'number', 'ex: 150', 1 UNION ALL
    SELECT 'parfumerie', 'unite', 'Unité', 'select', 'ml ou g', 2 UNION ALL
    SELECT 'maquillage', 'teinte', 'Teinte / Code couleur', 'text', 'ex: 01 Light, Rouge Rubis, 20', 1 UNION ALL
    SELECT 'complements-alimentaires', 'contenance', 'Contenance / Quantité', 'number', 'ex: 60', 1 UNION ALL
    SELECT 'complements-alimentaires', 'unite', 'Unité', 'select', 'Gélules, Comprimés, Gummies, g', 2 UNION ALL
    SELECT 'babouches-traditionnelles', 'pointure', 'Pointure', 'text', 'ex: 36, 37, 38...', 1 UNION ALL
    SELECT 'babouches-traditionnelles', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 2 UNION ALL
    SELECT 'babouches-traditionnelles', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 3 UNION ALL
    SELECT 'chaussures-de-ville', 'pointure', 'Pointure', 'text', 'ex: 36, 37, 38...', 1 UNION ALL
    SELECT 'chaussures-de-ville', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 2 UNION ALL
    SELECT 'chaussures-de-ville', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 3 UNION ALL
    SELECT 'sandales-mules', 'pointure', 'Pointure', 'text', 'ex: 36, 37, 38...', 1 UNION ALL
    SELECT 'sandales-mules', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 2 UNION ALL
    SELECT 'sandales-mules', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 3 UNION ALL
    SELECT 'chaussures-sport', 'pointure', 'Pointure', 'text', 'ex: 36, 37, 38...', 1 UNION ALL
    SELECT 'chaussures-sport', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 2 UNION ALL
    SELECT 'chaussures-sport', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 3 UNION ALL
    SELECT 'vetements-femme', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 1 UNION ALL
    SELECT 'vetements-femme', 'taille', 'Taille', 'select', 'XXS,XS,S,M,L,XL,2XL,3XL,4XL,5XL,6XL', 2 UNION ALL
    SELECT 'vetements-homme', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Marron cuir', 1 UNION ALL
    SELECT 'vetements-homme', 'taille', 'Taille', 'select', 'XXS,XS,S,M,L,XL,2XL,3XL,4XL,5XL,6XL', 2 UNION ALL
    SELECT 'vetements-enfant', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Rose', 1 UNION ALL
    SELECT 'vetements-enfant', 'age', 'Âge', 'text', 'ex: 3 mois, 2 ans, 6 ans', 2 UNION ALL
    SELECT 'vetements-sport', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc', 1 UNION ALL
    SELECT 'vetements-sport', 'taille', 'Taille / Âge', 'select', 'XXS,XS,S,M,L,XL,2XL,3XL,4XL,5XL,6XL', 2 UNION ALL
    SELECT 'vetements-sport', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 3 UNION ALL
    SELECT 'tenues-traditionnelles', 'couleur', 'Couleur', 'text', 'ex: Noir, Blanc, Bordeaux', 1 UNION ALL
    SELECT 'tenues-traditionnelles', 'taille', 'Taille / Âge', 'select', 'XXS,XS,S,M,L,XL,2XL,3XL,4XL,5XL,6XL', 2 UNION ALL
    SELECT 'tenues-traditionnelles', 'genre', 'Genre', 'select', 'Femme, Homme, Enfant, Unisexe', 3 UNION ALL
    SELECT 'bijoux-traditionnels', 'couleur', 'Couleur', 'text', 'ex: Or, Argent, Noir', 1 UNION ALL
    SELECT 'bijoux-traditionnels', 'matiere', 'Matière', 'text', 'ex: Or, Argent, Acier inoxydable, Cuir', 2 UNION ALL
    SELECT 'bijoux-modernes', 'couleur', 'Couleur', 'text', 'ex: Or, Argent, Noir', 1 UNION ALL
    SELECT 'bijoux-modernes', 'matiere', 'Matière', 'text', 'ex: Or, Argent, Acier inoxydable, Cuir', 2 UNION ALL
    SELECT 'sacs-maroquinerie', 'couleur', 'Couleur', 'text', 'ex: Or, Argent, Noir', 1 UNION ALL
    SELECT 'sacs-maroquinerie', 'matiere', 'Matière', 'text', 'ex: Or, Argent, Acier inoxydable, Cuir', 2 UNION ALL
    SELECT 'accessoires-mode', 'couleur', 'Couleur', 'text', 'ex: Or, Argent, Noir', 1 UNION ALL
    SELECT 'accessoires-mode', 'matiere', 'Matière', 'text', 'ex: Or, Argent, Acier inoxydable, Cuir', 2 UNION ALL
    SELECT 'epicerie-terroir', 'matiere', 'Matière', 'text', 'ex: Terre cuite, Laine, Cuivre', 1 UNION ALL
    SELECT 'epicerie-terroir', 'format', 'Format / Taille', 'text', 'ex: 2m x 3m, 1 kg, Grand modèle', 2 UNION ALL
    SELECT 'poterie-ceramique', 'matiere', 'Matière', 'text', 'ex: Terre cuite, Laine, Cuivre', 1 UNION ALL
    SELECT 'poterie-ceramique', 'format', 'Format / Taille', 'text', 'ex: 2m x 3m, 1 kg, Grand modèle', 2 UNION ALL
    SELECT 'tapis-marocains', 'matiere', 'Matière', 'text', 'ex: Terre cuite, Laine, Cuivre', 1 UNION ALL
    SELECT 'tapis-marocains', 'format', 'Format / Taille', 'text', 'ex: 2m x 3m, 1 kg, Grand modèle', 2 UNION ALL
    SELECT 'decoration-artisanale', 'matiere', 'Matière', 'text', 'ex: Terre cuite, Laine, Cuivre', 1 UNION ALL
    SELECT 'decoration-artisanale', 'format', 'Format / Taille', 'text', 'ex: 2m x 3m, 1 kg, Grand modèle', 2 UNION ALL
    SELECT 'linge-maison', 'couleur', 'Couleur', 'text', 'ex: Blanc, Gris, Doré', 1 UNION ALL
    SELECT 'linge-maison', 'format', 'Format / Taille', 'text', 'ex: 220x240cm, Standard, Petit modèle', 2 UNION ALL
    SELECT 'vaisselle-cuisine', 'couleur', 'Couleur', 'text', 'ex: Blanc, Gris, Doré', 1 UNION ALL
    SELECT 'vaisselle-cuisine', 'format', 'Format / Taille', 'text', 'ex: 220x240cm, Standard, Petit modèle', 2 UNION ALL
    SELECT 'decoration-vases', 'couleur', 'Couleur', 'text', 'ex: Blanc, Gris, Doré', 1 UNION ALL
    SELECT 'decoration-vases', 'format', 'Format / Taille', 'text', 'ex: 220x240cm, Standard, Petit modèle', 2 UNION ALL
    SELECT 'rangement-organisation', 'couleur', 'Couleur', 'text', 'ex: Blanc, Gris, Doré', 1 UNION ALL
    SELECT 'rangement-organisation', 'format', 'Format / Taille', 'text', 'ex: 220x240cm, Standard, Petit modèle', 2 UNION ALL
    SELECT 'materiel-sport', 'couleur', 'Couleur', 'text', 'ex: Blanc, Gris, Doré', 1 UNION ALL
    SELECT 'materiel-sport', 'format', 'Format / Taille', 'text', 'ex: 220x240cm, Standard, Petit modèle', 2
) a ON a.slug = c.slug;
