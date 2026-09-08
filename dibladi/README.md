# DiblaDi

Marketplace marocaine de produits locaux, construite avec React, Vite, Tailwind CSS et un backend Spring Boot connecte a MySQL. Le site permet de decouvrir des produits, de les filtrer par categorie ou boutique, de gerer un panier, de passer une commande, de publier des avis et de fournir des espaces dedies aux clients, vendeurs et administrateurs.

## Sommaire

1. [Presentation](#presentation)
2. [Fonctionnalites disponibles](#fonctionnalites-disponibles)
3. [Parcours utilisateur](#parcours-utilisateur)
4. [Routes frontend](#routes-frontend)
5. [Architecture frontend](#architecture-frontend)
6. [API frontend](#api-frontend)
7. [Backend et API REST](#backend-et-api-rest)
8. [Base de donnees](#base-de-donnees)
9. [Installation sous Windows](#installation-sous-windows)
10. [Commandes utiles](#commandes-utiles)
11. [Securite](#securite)
12. [Etat du projet](#etat-du-projet)

## Presentation

DiblaDi met en relation des clients avec des vendeurs et des marques marocaines. L'interface publique est en francais et met en avant les categories, les boutiques, les images produits, les prix en MAD, la livraison au Maroc et le paiement a la livraison.

Le projet est organise en deux applications :

- `dibladi/` : application web React/Vite.
- `dibladi/dibladi-backend/` : API Spring Boot, logique metier, securite JWT, migrations Flyway et connexion MySQL.

Le frontend communique avec le backend par HTTP via Axios. En developpement, le frontend utilise generalement `http://localhost:5173` et le backend `http://localhost:8082`.

## Fonctionnalites disponibles

### Catalogue public

- Page d'accueil avec barre d'annonce, en-tete, recherche, categories, hero, marques, produits, FAQ et footer.
- Affichage des produits sous forme de cartes avec image, nom, prix, note et ajout au panier.
- Page categorie avec chargement des categories parentes et des produits.
- Filtrage par slug de categorie grace au parametre `categorySlug`.
- Filtrage cote interface par prix minimum, prix maximum, note, boutique et disponibilite.
- Page boutique accessible avec `/boutique/:vendeurId`.
- Page marque accessible avec `/marque/:slug`.
- Recherche globale via le backend.
- Navigation vers la categorie d'un produit depuis le fil d'Ariane.

### Fiche produit

- Chargement d'un produit par son identifiant.
- Galerie d'images avec miniatures et navigation precedente/suivante.
- Nom, description, prix, ancien prix eventuel, stock, vendeur et note.
- Lien vendeur base sur `product.vendorId`.
- Lien vers la boutique qui contient le produit.
- Caracteristiques techniques issues des combinaisons de variantes.
- Selection de variantes comme couleur, taille, pointure, matiere ou format.
- Une valeur de variante est desactivee si aucune combinaison disponible ne correspond aux choix deja effectues, si `isAvailable` vaut faux ou si le stock est nul.
- Quantite limitee au stock de la variante selectionnee.
- Ajout au panier avec l'identifiant du produit, le vendeur, la variante, le prix et le libelle de combinaison.
- Avis clients : affichage, creation pour un client connecte, reponse vendeur et suppression autorisee par le flux vendeur.
- Modification de certaines informations par le vendeur proprietaire du produit : nom, prix, description et stock.

### Panier et commande

- Panier conserve dans `localStorage` sous la cle `dibladi_cart`.
- Ajout de plusieurs produits et de plusieurs variantes du meme produit.
- Deux lignes avec des variantes differentes restent separees.
- Suppression d'un article.
- Modification de la quantite.
- Vidage du panier.
- Calcul du sous-total.
- Calcul des frais de livraison par vendeur unique.
- Calcul du total panier.
- Passage vers la page de commande.
- Confirmation de commande apres creation cote backend.
- Consultation des commandes du client dans `mes-commandes`.

### Authentification

- Connexion client, vendeur ou administrateur.
- Inscription client.
- Demande d'inscription vendeur.
- Authentification Google via le composant `GoogleAuthButton` lorsque la configuration Google est disponible.
- Session conservee dans `localStorage` sous `dibladi_auth`.
- Token JWT egalement conserve sous `dibladi_token`.
- Injection automatique du token dans l'en-tete `Authorization: Bearer ...` par l'intercepteur Axios.
- Deconnexion et suppression des informations de session.
- Normalisation des roles `CLIENT`, `VENDOR` et `ADMIN`.

### Espace vendeur

- Tableau de bord vendeur.
- Consultation des produits du vendeur.
- Ajout d'un produit.
- Modification d'un produit.
- Suppression d'un produit.
- Gestion des variantes produit.
- Gestion des commandes recues.
- Consultation et modification du profil vendeur.
- Upload d'une photo vendeur.
- Reponse aux avis clients.

### Espace administrateur

Les pages administrateur sont protegees par `ProtectedRoute` et utilisent un layout dedie :

- tableau de bord ;
- gestion des vendeurs ;
- gestion des clients ;
- gestion des commandes ;
- gestion des livraisons et de leur statut ;
- gestion des categories ;
- gestion des demandes d'inscription vendeur ;
- approbation ou rejet d'une demande vendeur ;
- mise a jour du score d'un vendeur.

### Contenu legal et interface

- Conditions generales d'utilisation dans `/cgu`.
- Politique de confidentialite dans `/confidentialite`.
- Mentions legales dans `/mentions-legales`.
- Error boundary global pour eviter un ecran blanc lors d'une erreur React.
- Composant de remontee automatique en haut lors des changements de route.
- Header et footer masques sur les parcours d'administration et certains parcours vendeur.
- Chargement differe des pages avec `React.lazy` et `Suspense`.
- Animations de chargement et d'apparition avec Framer Motion.
- Icones avec Lucide React.
- Responsive desktop, tablette et mobile.

## Parcours utilisateur

### Client non connecte

1. Le client arrive sur `/`.
2. Il consulte une categorie, une marque, une boutique ou une recherche.
3. Il ouvre une fiche produit avec `/produit/:id`.
4. Il selectionne une variante et une quantite disponible.
5. Il ajoute le produit au panier.
6. Il se connecte ou cree un compte avant les actions necessitant une authentification.

### Client connecte

1. Le token est ajoute automatiquement aux appels API.
2. Il peut creer une commande avec ses articles et ses informations de livraison.
3. Il consulte ses commandes dans `/mes-commandes`.
4. Il peut laisser un avis sur un produit.

### Vendeur

1. Il demande son inscription depuis `/vendeur/inscription`.
2. Apres validation administrative, il accede au tableau de bord vendeur.
3. Il cree ses produits et leurs images.
4. Il ajoute eventuellement des combinaisons de variantes.
5. Il suit les commandes et repond aux avis.

### Administrateur

1. Il accede aux routes protegees d'administration.
2. Il verifie les vendeurs, clients, commandes et demandes.
3. Il approuve ou rejette les demandes vendeur.
4. Il gere les categories et les statuts de livraison.

## Routes frontend

Les routes sont definies dans `src/App.jsx`.

| Route | Page | Acces |
| --- | --- | --- |
| `/` | Accueil | Public |
| `/categorie/:nomCategorie` | Catalogue d'une categorie | Public |
| `/marque/:slug` | Produits d'une marque | Public |
| `/boutique/:vendeurId` | Produits d'une boutique vendeur | Public |
| `/produit/:id` | Detail produit | Public |
| `/connexion` | Connexion | Public |
| `/inscription` | Inscription client | Public |
| `/vendeur/inscription` | Inscription vendeur | Public |
| `/vendeur/connexion` | Redirection vers connexion | Public |
| `/panier` | Panier | Public |
| `/commande` | Checkout | Selon le flux de commande |
| `/confirmation-commande` | Confirmation | Selon le flux de commande |
| `/mes-commandes` | Commandes du client | Client |
| `/mon-compte` | Page compte actuellement placeholder | Public |
| `/cgu` | Conditions generales | Public |
| `/confidentialite` | Politique de confidentialite | Public |
| `/mentions-legales` | Mentions legales | Public |
| `/vendeur/dashboard` | Tableau de bord vendeur | Vendeur |
| `/vendeur/produits/ajouter` | Ajout produit | Vendeur |
| `/vendeur/produits/modifier/:id` | Modification produit | Vendeur |
| `/vendeur/parametres` | Parametres vendeur | Vendeur |
| `/admin/dashboard` | Dashboard admin | Administrateur |
| `/admin/vendeurs` | Vendeurs | Administrateur |
| `/admin/clients` | Clients | Administrateur |
| `/admin/commandes` | Commandes | Administrateur |
| `/admin/livraisons` | Livraisons | Administrateur |
| `/admin/categories` | Categories | Administrateur |
| `/admin/demandes` | Demandes vendeur | Administrateur |

## Architecture frontend

### Point d'entree

- `src/main.jsx` monte React et les providers globaux.
- `src/App.jsx` configure les routes, le header, le footer, le chargement differe et l'error boundary.

### Composants principaux

- `Header.jsx` : logo, recherche, langue, authentification, vente et panier.
- `TopAnnouncementBar.jsx` : annonces promotionnelles et services.
- `HeroSection.jsx` : presentation principale de la marketplace.
- `BrandsBar.jsx` : acces aux marques.
- `CategoriesGrid.jsx` : grille de categories.
- `ProductsGrid.jsx` : chargement et affichage de produits.
- `ProductCard.jsx` : carte produit reutilisable.
- `FiltersPanel.jsx` : filtres du catalogue.
- `FAQSection.jsx` : questions frequentes.
- `Footer.jsx` : navigation secondaire, contact et mentions.
- `ProtectedRoute.jsx` : protection par authentification et role.
- `ErrorBoundary.jsx` : capture des erreurs de rendu React.
- `LegalPageLayout.jsx` : structure partagee des pages legales.
- `vendeur/ProductForm.jsx` et `AddProductForm.jsx` : formulaires de produit.
- `vendeur/SellerProductCard.jsx` : produit dans l'espace vendeur.
- `vendeur/SellerOrdersSection.jsx` : commandes vendeur.

### Contextes et hooks

`AuthContext` expose `currentUser`, `login`, `logout`, `isAuthenticated`, `isAdmin`, `isClient` et `isVendor`.

`CartContext` expose `items`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `cartCount`, `cartSubtotal`, `cartDeliveryTotal` et `cartTotal`.

Les hooks `useAuth` et `useCart` fournissent un acces simple a ces contextes depuis les composants.

### Mapping des donnees

`src/utils/productMapper.js` convertit les reponses backend en donnees adaptees a l'interface :

- conversion des prix en nombres et en texte MAD ;
- calcul de `inStock` ;
- normalisation des notes ;
- conversion des images ;
- recuperation du vendeur, de la categorie et des variantes ;
- prise en charge des anciens prix et des frais de livraison.

## API frontend

Les fonctions Axios sont centralisees dans `src/utils/api.js`. Aucun export existant de ce fichier ne doit etre supprime.

### Catalogue et contenu public

| Fonction | Methode et endpoint |
| --- | --- |
| `fetchCategories` | `GET /api/categories` |
| `fetchBrands` | `GET /api/brands` |
| `fetchVendors` | `GET /api/vendors` |
| `fetchProducts(params)` | `GET /api/products` avec parametres |
| `fetchParentCategories` | `GET /api/parent-categories` |
| `globalSearch(query)` | `GET /api/search/global?query=...` |
| `fetchProductById(id)` | `GET /api/products/:id` |
| `fetchProductVariants(id)` | `GET /api/products/:id/variants` |
| `fetchCategoryAttributes(id)` | `GET /api/categories/:id/attributes` |

Pour une categorie, l'appel recommande est :

```js
const slug = nomCategorie || slugParam || categorySlug
const response = await fetchProducts({ categorySlug: slug })
```

`fetchProducts` transmet les parametres Axios sans les supprimer :

```js
export const fetchProducts = (params = {}) => api.get('/api/products', { params })
```

Le backend applique alors `categorySlug` ou `categoryId` avant de retourner les produits.

### Authentification et compte

| Fonction | Methode et endpoint |
| --- | --- |
| `login` | `POST /api/auth/login` |
| `registerClient` | `POST /api/auth/register/client` |
| `registerVendor` | `POST /api/auth/register/vendor` |
| `fetchCurrentVendorProfile` | `GET /api/vendors/me` |
| `updateCurrentVendorProfile` | `PUT /api/vendors/me` |

### Produits vendeur

| Fonction | Methode et endpoint |
| --- | --- |
| `createProductWithVariants` | `POST /api/products` |
| `updateProduct` | `PUT /api/products/:id` |
| `deleteProduct` | `DELETE /api/products/:id` |
| `updateProductVariant` | `PUT /api/products/:productId/variants/:variantId` |

### Images

| Fonction | Methode et endpoint |
| --- | --- |
| `uploadProductImage` | `POST /api/upload/product-image` |
| `uploadCategoryImage` | `POST /api/upload/product-image` |
| `uploadVendorPhoto` | `POST /api/upload/vendor-photo` |

Les images sont envoyees en `multipart/form-data`. Le backend renvoie une URL HTTP persistante, et non une URL temporaire `blob:` du navigateur.

### Commandes et avis

| Fonction | Methode et endpoint |
| --- | --- |
| `createOrder` | `POST /api/orders` |
| `fetchMyOrders` | `GET /api/orders/my-orders` |
| `fetchVendorOrders` | `GET /api/orders/vendor-orders` |
| `createReview` | `POST /api/reviews` |
| `fetchReviewsByProduct` | `GET /api/reviews?productId=...` |
| `replyToReview` | `PUT /api/reviews/:id/reply` |
| `deleteReview` | `DELETE /api/reviews/:id` |

### Administration

Les fonctions administrateur couvrent le dashboard, les vendeurs, clients, commandes, livraisons, categories et demandes vendeur. Elles utilisent notamment :

- `GET /api/admin/dashboard` ;
- `GET /api/admin/vendors` et `PUT /api/admin/vendors/:id/score` ;
- `GET /api/admin/clients` ;
- `GET /api/admin/orders` ;
- `GET /api/admin/deliveries` et `PUT /api/admin/deliveries/:id/status` ;
- `GET`, `POST`, `PUT` et `DELETE /api/admin/categories` ;
- `GET /api/admin/requests` ;
- `POST /api/admin/requests/:id/approve` ;
- `POST /api/admin/requests/:id/reject`.

## Backend et API REST

Le backend est une application Spring Boot situee dans `dibladi-backend/`.

### Controleurs

- `AuthController` : connexion et inscriptions.
- `CatalogController` : categories et catalogue public.
- `ProductController` : detail, creation, modification, suppression et produits du vendeur.
- `ProductVariantController` : lecture et modification des variantes.
- `CategoryController` : categories et attributs.
- `ParentCategoryController` : categories parentes et sous-categories.
- `BrandController` : marques.
- `VendorPublicController` : liste publique des vendeurs approuves.
- `VendorController` : profil vendeur connecte.
- `OrderController` : creation et consultation des commandes.
- `ReviewController` : avis et reponses vendeur.
- `UploadController` : photos vendeur et images produit.
- `SearchController` : recherche globale.
- `AdminController` : administration.

### Endpoint catalogue et filtrage par categorie

Le endpoint public est defini dans `CatalogController` :

```http
GET /api/products?categorySlug=vetements-femme
GET /api/products?categoryId=12
GET /api/products
```

Le service choisit le filtre dans cet ordre :

1. `categorySlug` non vide ;
2. `categoryId` fourni ;
3. tous les produits si aucun filtre de categorie n'est fourni.

Le repository utilise les methodes Spring Data suivantes :

```java
List<Product> findByCategorySlugAndIsActiveTrue(String slug);
List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
```

`ProductController` conserve les operations produit sous `/api/products`, notamment `/api/products/:id` et `/api/products/vendor/me`. Le catalogue public `/api/products` est volontairement gere par `CatalogController` afin d'eviter deux mappings concurrents sur le meme endpoint.

### Variantes et stock

Une variante contient notamment :

- `combinationLabel` : combinaison JSON des attributs ;
- `stockQuantity` : quantite disponible ;
- `isAvailable` : indicateur d'activation ;
- prix et identifiant de variante.

La fiche produit parse les combinaisons, construit la liste des attributs et verifie chaque valeur avec les regles suivantes :

- la variante doit etre disponible ;
- son stock doit etre superieur a zero ;
- elle doit correspondre aux attributs deja selectionnes ;
- une valeur incompatible est desactivee visuellement et fonctionnellement.

Le service backend recalcule egalement la disponibilite lors de la creation ou de la modification d'une variante.

## Base de donnees

- MySQL 8 est utilise comme base relationnelle.
- Flyway applique les migrations dans `src/main/resources/db/migration/`.
- `V1__init_schema.sql` cree le schema initial.
- `V2__seed_categories.sql` initialise les categories.
- `V3__seed_admin.sql` initialise le compte administrateur prevu par le projet.
- Les entites JPA se trouvent dans `entity/`.
- Les interfaces Spring Data se trouvent dans `repository/`.
- Les DTO separent les donnees de l'API des entites internes.

Le fichier `docker-compose.yml` prepare un service MySQL pour le developpement. Les identifiants doivent etre lus depuis la configuration locale et ne doivent pas etre exposes dans un depot public.

## Installation sous Windows

### Prerequis

- Node.js et npm.
- Java 21.
- Docker Desktop.
- Maven 3.9 ou l'utilisation du wrapper Maven fourni.

### 1. Installer les dependances frontend

Depuis le dossier `dibladi` :

```powershell
npm install
```

### 2. Demarrer MySQL

Depuis `dibladi/dibladi-backend` :

```powershell
docker compose up -d
```

Pour supprimer les volumes et repartir sur une base vide :

```powershell
docker compose down -v
docker compose up -d
```

Cette operation efface les donnees locales de la base.

### 3. Configurer les variables d'environnement

Renseigner les valeurs attendues par Spring Boot, notamment :

- `MYSQL_DATABASE` ;
- `MYSQL_USER` ;
- `MYSQL_PASSWORD` ;
- `MYSQL_ROOT_PASSWORD` ;
- `JWT_SECRET` ;
- `MAIL_USERNAME` ;
- `MAIL_PASSWORD`.

Le frontend peut utiliser `VITE_API_URL` pour changer l'adresse du backend. Par defaut :

```text
http://localhost:8082
```

### 4. Demarrer le backend

```powershell
cd dibladi-backend
.\mvnw.cmd spring-boot:run
```

### 5. Demarrer le frontend

Dans un autre terminal :

```powershell
cd dibladi
npm run dev
```

Ouvrir l'URL affichee par Vite, generalement `http://localhost:5173`.

## Commandes utiles

Depuis `dibladi/` :

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Depuis `dibladi/dibladi-backend/` :

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
.\mvnw.cmd -DskipTests package
```

Le build frontend produit le dossier `dist/`. Le build backend produit un fichier JAR dans `target/`.

## Securite

- Authentification stateless par JWT.
- Mots de passe proteges par BCrypt.
- Spring Security protege les operations privees.
- `ProtectedRoute` protege les vues frontend selon le role.
- Axios ajoute automatiquement le JWT aux requetes lorsque la session existe.
- CORS est configure pour le frontend local.
- Les secrets, mots de passe SMTP et cles JWT doivent rester dans des variables d'environnement.

## Upload des images

Le flux d'image est le suivant :

1. Le formulaire recoit un objet `File`.
2. Le frontend cree un `FormData`.
3. Le fichier est envoye a `/api/upload/product-image` ou `/api/upload/vendor-photo`.
4. Le backend sauvegarde le fichier dans le dossier configure par `app.upload-dir`.
5. Une URL HTTP persistante est retournee.
6. Cette URL est enregistree avec le produit ou le vendeur.

Une URL `blob:` ne doit pas etre enregistree en base : elle n'existe que dans la memoire du navigateur.

## Design et identite visuelle

La palette principale utilise :

- rouge DiblaDi `#B30808` pour la marque et les actions principales ;
- blanc et `#FAFAFA` pour les surfaces ;
- `#1A1A1A` pour le texte principal ;
- `#555555` pour le texte secondaire ;
- `#E0E0E0` pour les bordures ;
- vert pour le stock et la disponibilite ;
- orange pour les promotions ;
- jaune pour les etoiles ;
- bleu pour certains accents de categories.

Tailwind est configure dans `tailwind.config.js`. Les styles globaux sont repartis entre `src/index.css`, `src/App.css` et `src/styles/global.css`.

## Etat du projet

### Fonctionnel et verifie

- Build frontend Vite reussi.
- Build backend Maven reussi avec `BUILD SUCCESS`.
- Route `/boutique/:vendeurId` reliee a la page boutique.
- Produit lie a sa boutique avec `product.vendorId`.
- Filtrage de categorie par `categorySlug`.
- Repository backend equipe des recherches par slug et par identifiant.
- Disponibilite des variantes calculee selon stock et selection courante.
- Verification navigateur effectuee sur une fiche produit, une boutique et une categorie sans erreur console.

### Pages encore prevues ou partielles

- `/mon-compte` utilise encore `PlaceholderPage`.
- `/admin` seul utilise encore une page placeholder, tandis que les sous-pages admin sont disponibles.
- La page boutique reutilise `BrandPage` et filtre les produits selon le vendeur identifie.
- L'integration d'un stockage d'images externe comme Cloudinary reste une amelioration de production.
- La mise en place HTTPS, la gestion de secrets en production et un fournisseur SMTP professionnel restent a prevoir pour le deploiement.

## Deploiement futur

Avant une mise en production :

- remplacer les valeurs sensibles de developpement ;
- utiliser un stockage d'images durable comme Cloudinary ou S3 ;
- servir l'application en HTTPS ;
- configurer un domaine et les regles CORS de production ;
- utiliser un service SMTP professionnel ;
- sauvegarder et surveiller la base MySQL ;
- ajouter des tests d'integration pour les commandes, paiements eventuels, stocks et permissions.
