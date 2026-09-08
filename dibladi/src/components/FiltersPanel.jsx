import { Star, X } from 'lucide-react'

function FiltersPanel({
  filters,
  availableBrands,
  onPriceChange,
  onRatingChange,
  onBrandToggle,
  onStockToggle,
  onReset,
  onClose,
}) {
  return (
    <div className="h-full bg-white lg:rounded-xl lg:border lg:border-gray-border">
      <div className="flex items-center justify-between border-b border-gray-border px-5 py-4 lg:px-6">
        <h2 className="text-[18px] font-bold text-black-text">Filtres</h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-text transition-colors duration-200 hover:text-red-main lg:hidden"
            aria-label="Fermer les filtres"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5 lg:px-6">
        <section className="border-b border-gray-border pb-5">
          <h3 className="text-[16px] font-bold text-black-text">Prix</h3>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-semibold text-black-text">Prix minimum (MAD)</span>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(event) => onPriceChange('minPrice', event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-white px-3 text-sm text-black-text outline-none transition-colors duration-200 placeholder:text-gray-text focus:border-red-main"
                placeholder="0"
              />
            </label>
            <label className="block">
              <span className="text-semibold text-black-text">Prix maximum (MAD)</span>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => onPriceChange('maxPrice', event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-white px-3 text-sm text-black-text outline-none transition-colors duration-200 placeholder:text-gray-text focus:border-red-main"
                placeholder="5000"
              />
            </label>
          </div>
        </section>

        <section className="border-b border-gray-border pb-5">
          <h3 className="text-[16px] font-bold text-black-text">Marque</h3>
          <div className="mt-3 space-y-2">
            {availableBrands.map((brand) => {
              const isChecked = filters.brands.includes(brand)

              return (
                <label key={brand} className="flex cursor-pointer items-center gap-2 text-semibold text-gray-text">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onBrandToggle(brand)}
                    className="h-4 w-4 rounded border-gray-border text-red-main focus:ring-red-main"
                  />
                  <span>{brand}</span>
                </label>
              )
            })}
          </div>
        </section>
        
        <section className="border-b border-gray-border pb-5">
          <h3 className="text-[16px] font-bold text-black-text">Note minimale</h3>
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const isSelected = filters.minRating === rating

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onRatingChange(rating)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-semibold transition-colors duration-200 ${
                    isSelected
                      ? 'border-red-main bg-red-light text-red-main'
                      : 'border-gray-border text-gray-text hover:border-red-main hover:text-red-main'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-accent" fill="currentColor" aria-hidden="true" />
                    <span>{rating} etoiles et plus</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>


        <section>
          <h3 className="text-[16px] font-bold text-black-text">Disponibilité</h3>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-semibold text-gray-text">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={() => onStockToggle()}
              className="h-4 w-4 rounded border-gray-border text-red-main focus:ring-red-main"
            />
            <span>Afficher uniquement les produits en stock</span>
          </label>
        </section>

        <button
          type="button"
          onClick={onReset}
          className="text-semibold font-medium text-red-main transition-colors duration-200 hover:text-red-dark"
        >
          Reinitialiser les filtres
        </button>
      </div>
    </div>
  )
}

export default FiltersPanel
