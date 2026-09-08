export function formatMadPrice(value) {
  const num = Number(value)
  if (Number.isNaN(num)) {
    return ''
  }

  return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD`
}

export function mapProductFromApi(product) {
  if (!product) {
    return null
  }

  const priceValue = Number(product.price ?? product.priceValue ?? 0)
  const stockQuantity = Number(product.stockQuantity ?? 0)
  const rawOldPrice = product.oldPrice ?? product.old_price
  const rawDeliveryFee = product.deliveryFee ?? product.deliveryFeeValue
  const deliveryFeeValue =
    rawDeliveryFee != null && rawDeliveryFee !== ''
      ? Number(rawDeliveryFee)
      : 30
  const deliveryFee =
    !Number.isNaN(deliveryFeeValue) && deliveryFeeValue >= 0
      ? formatMadPrice(deliveryFeeValue)
      : ''

  const oldPriceValue =
    rawOldPrice != null && rawOldPrice !== '' ? Number(rawOldPrice) : undefined
  const hasValidOldPrice =
    typeof oldPriceValue === 'number' &&
    !Number.isNaN(oldPriceValue) &&
    oldPriceValue > priceValue

  return {
    ...product,
    id: product.id,
    name: product.name,
    image: product.images?.[0] ?? product.image ?? '',
    images: product.images ?? [],
    priceValue,
    price:
      typeof product.price === 'string' && product.price.includes('MAD')
        ? product.price
        : formatMadPrice(priceValue),
    deliveryFeeValue,
    deliveryFee,
    oldPriceValue: hasValidOldPrice ? oldPriceValue : undefined,
    oldPrice: hasValidOldPrice ? formatMadPrice(oldPriceValue) : undefined,
    rating: Number(product.averageRating ?? product.rating ?? 0),
    averageRating: Number(product.averageRating ?? 0),
    reviewsCount: product.reviewsCount ?? 0,
    inStock: stockQuantity > 0,
    stockQuantity,
    isNew: product.isNew ?? false,
  }
}

export function mapProductDetailFromApi(product) {
  const mapped = mapProductFromApi(product)
  if (!mapped) {
    return null
  }

  return {
    ...mapped,
    category: product.category ?? '',
    categoryId: product.categoryId,
    description: product.description ?? '',
    sellerName: product.sellerName ?? product.sellerShopName ?? 'Vendeur DiblaDi',
    sellerId: product.vendorId ?? product.sellerId,
    sellerRating: Number(product.sellerRating ?? mapped.rating ?? 4.5),
    reviews: product.reviews ?? [],
  }
}

export function mapProductsFromApi(products) {
  if (!Array.isArray(products)) {
    return []
  }

  return products.map(mapProductFromApi).filter(Boolean)
}
