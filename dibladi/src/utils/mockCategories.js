// TODO: Cette liste sera gérée dynamiquement par l'admin une fois le
// backend Spring Boot branché. L'admin pourra ajouter, modifier ou désactiver
// des catégories depuis son espace (section Gestion des catégories).

const mockCategories = [
  { id: 'tout', name: 'Tout', slug: 'tout', isActive: true },
  { id: 'robes', name: 'Robes', slug: 'robes', isActive: true },
  { id: 'djellabas', name: 'Djellabas', slug: 'djellabas', isActive: true },
  { id: 'caftans', name: 'Caftans', slug: 'caftans', isActive: true },
  { id: 'jeans', name: 'Jeans', slug: 'jeans', isActive: true },
  { id: 't-shirts', name: 'T-shirts', slug: 't-shirts', isActive: true },
  { id: 'vestes', name: 'Vestes', slug: 'vestes', isActive: true },
  { id: 'pulls', name: 'Pulls', slug: 'pulls', isActive: true },
  { id: 'chaussures', name: 'Chaussures', slug: 'chaussures', isActive: true },
  { id: 'babouches', name: 'Babouches', slug: 'babouches', isActive: true },
  { id: 'accessoires', name: 'Accessoires', slug: 'accessoires', isActive: true },
  { id: 'bijoux', name: 'Bijoux', slug: 'bijoux', isActive: true },
  { id: 'sacs', name: 'Sacs', slug: 'sacs', isActive: true },
  { id: 'ceintures', name: 'Ceintures', slug: 'ceintures', isActive: true },
  { id: 'foulards', name: 'Foulards', slug: 'foulards', isActive: true },
  { id: 'artisanat', name: 'Artisanat', slug: 'artisanat', isActive: true },
  { id: 'tapis', name: 'Tapis', slug: 'tapis', isActive: true },
  { id: 'poterie', name: 'Poterie', slug: 'poterie', isActive: true },
  { id: 'decoration', name: 'Décoration', slug: 'decoration', isActive: true },
  { id: 'enfants', name: 'Enfants', slug: 'enfants', isActive: true },
  { id: 'sport', name: 'Sport', slug: 'sport', isActive: true },
  { id: 'beaute', name: 'Beauté', slug: 'beaute', isActive: true },
  { id: 'parfums', name: 'Parfums', slug: 'parfums', isActive: true },
  { id: 'maison', name: 'Maison', slug: 'maison', isActive: true },
]

export function getActiveCategories() {
  return mockCategories.filter((category) => category.isActive)
}

export default mockCategories
