import { Pencil, Trash2, Star } from 'lucide-react'

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function SellerProductCard({ product, onEdit, onDelete }) {
  const filledStars = Math.round(product.rating ?? 0)
  const displayImage = product.image || product.images?.[0] || ''

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
      <div
        onClick={() => onEdit(product.id)}
        className="cursor-pointer"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-gray-bg">
          {displayImage ? (
            <img src={displayImage} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-text">
              Produit DiblaDi
            </div>
          )}

          <span className="absolute left-3 top-3 rounded-full border border-gray-border bg-white px-2.5 py-1 text-[11px] font-medium text-black-text">
            {product.stockQuantity > 0 ? 'En stock' : 'Hors stock'}
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="truncate text-[15px] font-medium text-black-text">{product.name}</h3>

          <div className="flex items-center gap-2 text-[13px] text-gray-text">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => {
                const isFilled = index < filledStars

                return (
                  <Star
                    key={`seller-star-${product.id}-${index}`}
                    size={14}
                    className={isFilled ? 'text-red-main' : 'text-gray-border'}
                    fill={isFilled ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                )
              })}
            </div>
            <span>({product.reviewsCount ?? 0} avis)</span>
          </div>

          <p className="text-lg font-bold text-red-main">
            {product.price ?? `${formatPrice(product.priceValue)} MAD`}
          </p>

          <p className="text-xs text-gray-text">Cliquer pour modifier</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-border p-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(product.id)
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-border bg-white px-3 py-2 text-xs font-medium text-black-text transition-colors duration-200 hover:bg-gray-bg"
        >
          <Pencil size={14} aria-hidden="true" />
          Modifier
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(product.id)
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-red-main px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-red-dark"
        >
          <Trash2 size={14} aria-hidden="true" />
          Supprimer
        </button>
      </div>
    </article>
  )
}

export default SellerProductCard
