import { useEffect, useState } from 'react'
import { Heart, ShoppingCart, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCart from '../hooks/useCart'

function ProductCard({
  id,
  image,
  images,
  name,
  price,
  priceValue,
  oldPrice,
  oldPriceValue,
  deliveryFee,
  deliveryFeeValue,
  rating,
  averageRating,
  reviewsCount,
  reviewCount,
  sellerId,
  isNew = false,
}) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  const displayImage = image || images?.[0] || ''
  const displayName = name || 'Produit DiblaDi'
  const displayPrice = price || (typeof priceValue === 'number' ? `${priceValue.toFixed(2)} MAD` : '')
  const hasPromo =
    typeof oldPriceValue === 'number' &&
    typeof priceValue === 'number' &&
    oldPriceValue > priceValue
  const discountPercent = hasPromo
    ? Math.round((1 - priceValue / oldPriceValue) * 100)
    : 0

  useEffect(() => {
    if (!isAdded) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setIsAdded(false)
    }, 1200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isAdded])

  return (
    <article
      onClick={() => navigate(`/produit/${id}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
    >
      {/* Zone image */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-gray-bg">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-text/70" />
        )}

        {/* Badges Nouveau / Promo */}
        {(isNew || hasPromo) && (
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-accent px-2.5 py-1 text-[11px] font-medium text-white shadow-[0_2px_10px_rgba(243,156,18,0.5)]">
                <Sparkles size={11} aria-hidden="true" />
                Nouveau
              </span>
            )}
            {hasPromo && (
              <span className="inline-flex w-fit items-center rounded-full bg-green-accent px-2.5 py-1 text-[11px] font-medium text-white">
                Promo
              </span>
            )}
          </div>
        )}

        {/* Bouton Favoris */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setIsFavorite((value) => !value)
          }}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black-text transition-colors duration-200 hover:text-red-main"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            size={16}
            className={isFavorite ? 'text-red-main' : 'text-black-text'}
            fill={isFavorite ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Zone contenu */}
      <div className="flex flex-1 flex-col p-4">
        <div className="min-h-[3.25rem] overflow-hidden">
          <h3 className="line-clamp-2 text-2xl font-bold leading-snug text-black-text">
            {displayName}
          </h3>
        </div>

        <div className="mt-3 flex flex-1 flex-col justify-end">
          <div className="flex flex-wrap items-baseline justify-center gap-2">
            <p className="text-3xl font-extrabold text-red-main">
              {displayPrice}
            </p>
            {hasPromo && (
              <>
                <p className="text-sm text-gray-text line-through">
                  {oldPrice}
                </p>
                <span className="rounded bg-orange-accent/15 px-1.5 py-0.5 text-xs font-semibold text-orange-accent">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              addToCart({
                id,
                name: displayName,
                image: displayImage,
                price: Number(price ?? priceValue ?? 0),
                priceValue: Number(price ?? priceValue ?? 0),
                deliveryFee: 40,
                deliveryFeeValue: 40,
                vendorId: Number(sellerId ?? 0),
                sellerId: Number(sellerId ?? 0),
              }, 1)
              setIsAdded(true)
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
          >
            <ShoppingCart size={16} aria-hidden="true" />
            {isAdded ? 'Ajouté ✓' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard