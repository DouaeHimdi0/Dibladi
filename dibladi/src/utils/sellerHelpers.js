// TODO: remplacer par le sellerId réel associé au compte vendeur authentifié (backend Spring Boot)
export const DEMO_SELLER_ID = 'atlas-boutique'

// TODO: remplacer par le nom de boutique réel du profil vendeur une fois le backend prêt
export const DEMO_SHOP_NAME = 'Boutique Artisanat Fès'

export const DEMO_SELLER_SCORE = 87

export const PRODUCT_CATEGORIES = [
  'Robes',
  'Djellabas',
  'Jeans',
  'T-shirts',
  'Vestes',
  'Chaussures',
  'Accessoires',
  'Bijoux',
  'Sacs',
  'Artisanat',
  'Enfants',
  'Sport',
]

export function categoryToSlug(label) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

export function slugToCategoryLabel(slug) {
  if (!slug) {
    return ''
  }

  const match = PRODUCT_CATEGORIES.find(
    (category) => categoryToSlug(category) === slug.toLowerCase(),
  )

  if (match) {
    return match
  }

  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function getDemoSellerId() {
  return DEMO_SELLER_ID
}

export function getSellerProducts(sellerId = DEMO_SELLER_ID) {
  return []
}

export function findSellerProduct(productId, sellerId = DEMO_SELLER_ID) {
  return null
}

export function getSellerOrders(sellerId = DEMO_SELLER_ID) {
  return []
}

export function getOrderStats(orders) {
  return {
    enCours: orders.filter((order) => order.statut === 'En cours').length,
    refusees: orders.filter((order) => order.statut === 'Refusée').length,
    livrees: orders.filter((order) => order.statut === 'Livrée').length,
    total: orders.length,
  }
}
