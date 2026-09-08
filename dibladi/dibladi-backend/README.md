# DiblaDi Backend — Spring Boot

## Prérequis
- Java 21
- Maven 3.9+
- Docker Desktop

## Lancer la base de données
```bash
cd dibladi-backend
cp .env.example .env
# Remplir les valeurs dans .env
docker-compose up -d
```

## Lancer le backend
```bash
cd dibladi-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Variables d'environnement requises (.env)
- `MYSQL_DATABASE` : nom de la base de données MySQL
- `MYSQL_USER` : nom de l'utilisateur MySQL
- `MYSQL_PASSWORD` : mot de passe de l'utilisateur MySQL
- `MYSQL_ROOT_PASSWORD` : mot de passe root MySQL
- `JWT_SECRET` : clé secrète pour signer les JWT
- `MAIL_USERNAME` : compte SMTP d'envoi
- `MAIL_PASSWORD` : mot de passe SMTP

## Architecture

- `config/` : configuration Spring Security, CORS et JWT
- `controller/` : API REST exposées pour l'authentification, l'administration, les vendeurs et les entités métier
- `dto/` : objets de requête et de réponse pour découpler l'API des entités JPA
- `entity/` : entités JPA mappées en base
- `enums/` : énumérations métiers partagées
- `exception/` : gestion globale des erreurs et exceptions personnalisées
- `repository/` : interfaces Spring Data JPA
- `security/` : gestion JWT, filtres et détails utilisateur
- `service/` : logique métier et services applicatifs
- `src/main/resources/db/migration/` : migrations Flyway

## Endpoints API

### Auth
- `POST /api/auth/login` : connexion utilisateur
- `POST /api/auth/register/client` : inscription client
- `POST /api/auth/register/vendor` : demande inscription vendeur
- `POST /api/auth/refresh` : rafraîchissement de token

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/vendors`
- `PUT /api/admin/vendors/{id}/score`
- `GET /api/admin/orders`
- `GET /api/admin/deliveries`
- `GET /api/admin/requests`
- `POST /api/admin/requests/{id}/approve`
- `POST /api/admin/requests/{id}/reject`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

### Vendor
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/orders/vendor-orders`

### Client
- `GET /api/products/**`
- `GET /api/categories/**`
- `POST /api/orders`
- `POST /api/reviews`

## Sécurité

- JWT pour l'authentification stateless
- BCrypt pour le hash des mots de passe
- Spring Security pour protéger les routes
- CORS autorisant `http://localhost:5173`

## Base de données

- Flyway pour les migrations
- MySQL comme base relationnelle
- Schéma initial défini dans `src/main/resources/db/migration/V1__init_schema.sql`
- Seed categories dans `V2__seed_categories.sql`
- Compte admin seedé dans `V3__seed_admin.sql`

## Connexion MySQL Workbench

Host: localhost
Port: 3306
Username: dibladi_user
Password: Dibladi2026

## Migration PostgreSQL → MySQL

Changements effectués:
- Remplacement des types PostgreSQL (`SERIAL`, `NUMERIC`) par des équivalents MySQL (`BIGINT AUTO_INCREMENT`, `DECIMAL`).
- Adaptation des contraintes et de la syntaxe DDL pour MySQL (engine InnoDB, `CURRENT_TIMESTAMP` par défaut).
- Mise à jour de la configuration Spring (`application.yml`) pour utiliser le driver MySQL et le dialecte `MySQLDialect`.
- Remplacement du service Docker PostgreSQL par une instance MySQL dans `docker-compose.yml`.
- Variables d'environnement `.env` renommées pour MySQL.

Pourquoi MySQL:
- Familiarité avec MySQL Workbench et outils associés (préférence de l'équipe / expérience de stage Marjane).
- MySQL 8.0 est largement supporté et simple à déployer via Docker pour un environnement de développement.

## Correctif - Upload images produits

Le bug historique venait des blob URLs du navigateur (`blob:http://localhost:5173/...`).
Ces URLs ne sont pas des URLs backend réelles : elles existent uniquement dans la mémoire du navigateur, donc elles ne sont pas persistantes en base, ni exploitables depuis un autre client, ni visibles dans la marketplace.

Le flux correct est désormais le suivant :
1. L'utilisateur sélectionne un `File` dans le formulaire.
2. Le frontend crée un `FormData`.
3. Le frontend appelle `POST /api/upload/product-image`.
4. Le backend sauvegarde le fichier physiquement dans le dossier de stockage
   `uploads/vendor-photos` (configuré via `app.upload-dir`).
5. Le backend retourne une vraie URL HTTP du serveur, par exemple :
   `http://localhost:8082/uploads/vendor-photos/<uuid>.jpg`
6. Cette URL absolue est ensuite sauvegardée en base dans `product_images`.

Endpoint d'upload :
- `POST /api/upload/product-image`
- `POST /api/upload/vendor-photo`

Dossier de stockage local :
- `dibladi-backend/uploads/vendor-photos/`

Nettoyage SQL des blobs invalides :
```sql
DELETE FROM product_images
WHERE image_url LIKE 'blob:%';
```

Vérification :
```sql
SELECT * FROM product_images;
```

## TODO pour la mise en production
- Cloudinary pour les images
- Variables d'environnement sécurisées sur OVH
- HTTPS via Cloudflare
- SendGrid ou service SMTP professionnel
