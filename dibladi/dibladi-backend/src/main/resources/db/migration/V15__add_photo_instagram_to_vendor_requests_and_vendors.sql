-- V15: Ajout des colonnes photo_url et instagram_link aux tables vendor_requests et vendors
--
-- Contexte:
--   - photo_url    : URL de la photo de profil/boutique uploadée lors de l'inscription
--   - instagram_link : Lien Instagram spécifique du vendeur
--   - social_link  : Reste comme lien "autre réseau social" générique (Facebook, TikTok, site web, etc.)
--
-- Ces deux colonnes sont nullable car elles ne sont pas obligatoires à l'inscription.
-- Les données existantes (ex: seed V6) conservent NULL pour ces colonnes.

-- VENDOR_REQUESTS
ALTER TABLE vendor_requests
    ADD COLUMN photo_url     VARCHAR(500) NULL COMMENT 'URL de la photo de profil/boutique uploadée lors de l''inscription',
    ADD COLUMN instagram_link VARCHAR(255) NULL COMMENT 'Lien Instagram du vendeur';

-- VENDORS
-- Permet de conserver ces informations après validation de la demande par l'admin
ALTER TABLE vendors
    ADD COLUMN photo_url     VARCHAR(500) NULL COMMENT 'URL de la photo de profil/boutique copiée depuis la VendorRequest lors de l''approbation',
    ADD COLUMN instagram_link VARCHAR(255) NULL COMMENT 'Lien Instagram copié depuis la VendorRequest lors de l''approbation';
