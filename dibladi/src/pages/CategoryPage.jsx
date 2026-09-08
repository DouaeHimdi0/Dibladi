import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, FilterX, SearchX, SlidersHorizontal } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import FiltersPanel from '../components/FiltersPanel'
import SectionTitle from '../components/SectionTitle'
import { fetchParentCategories, fetchProducts } from '../utils/api'
import { mapProductsFromApi } from '../utils/productMapper'

function formatCategoryLabel(value) {
  if (!value) {
    return 'Categorie'
  }

  if (value === 'tout') {
    return 'Tout'
  }

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function CategoryPage() {
  const { nomCategorie } = useParams()
  const slug = nomCategorie
  const categoryLabel = formatCategoryLabel(slug)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [parentCategories, setParentCategories] = useState([])
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    brands: [],
    inStockOnly: false,
  })

  useEffect(() => {
    setIsMobileFiltersOpen(false)
  }, [nomCategorie])

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      fetchProducts({ categorySlug: slug === 'tout' ? undefined : slug }),
      fetchParentCategories(),
    ])
      .then(([{ data }, parents]) => {
        setProducts(mapProductsFromApi(data))
        setParentCategories(parents)
      })
      .catch(() => {
        setProducts([])
        setError('Impossible de charger les produits de cette catégorie.')
      })
      .finally(() => setLoading(false))
  }, [slug])

  const selectedSubcategory = parentCategories
    .flatMap((parent) => (parent.subcategories || []).map((subcategory) => ({ ...subcategory, parent })))
    .find((subcategory) => subcategory.slug === nomCategorie)
  const pageCategoryLabel = selectedSubcategory?.name || categoryLabel

  const availableBrands = useMemo(
    () => [...new Set(products.map((product) => product.sellerShopName).filter(Boolean))].sort(),
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const minPrice = filters.minPrice ? Number(filters.minPrice) : null
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null
      const productPrice = Number(product.priceValue ?? product.price ?? 0)
      const matchesMinPrice = minPrice === null || productPrice >= minPrice
      const matchesMaxPrice = maxPrice === null || productPrice <= maxPrice
      const matchesRating = filters.minRating === 0 || Number(product.averageRating || 0) >= filters.minRating
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.sellerShopName)
      const matchesStock = !filters.inStockOnly || Number(product.stockQuantity || 0) > 0

      return matchesMinPrice && matchesMaxPrice && matchesRating && matchesBrand && matchesStock
    })
  }, [filters, products])

  function handlePriceChange(field, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  function handleRatingChange(value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      minRating: value,
    }))
  }

  function handleBrandToggle(brand) {
    setFilters((currentFilters) => {
      const isSelected = currentFilters.brands.includes(brand)

      return {
        ...currentFilters,
        brands: isSelected
          ? currentFilters.brands.filter((item) => item !== brand)
          : [...currentFilters.brands, brand],
      }
    })
  }

  function handleStockToggle() {
    setFilters((currentFilters) => ({
      ...currentFilters,
      inStockOnly: !currentFilters.inStockOnly,
    }))
  }

  function handleResetFilters() {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      brands: [],
      inStockOnly: false,
    })
  }

  const filtersPanel = (
    <FiltersPanel
      filters={filters}
      availableBrands={availableBrands}
      onPriceChange={handlePriceChange}
      onRatingChange={handleRatingChange}
      onBrandToggle={handleBrandToggle}
      onStockToggle={handleStockToggle}
      onReset={handleResetFilters}
      onClose={() => setIsMobileFiltersOpen(false)}
    />
  )

  return (
    <main className="bg-off-white px-4 py-8 text-black-text sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav className="mb-4 flex items-center gap-2 text-[14px] text-gray-text">
          <Link to="/" className="transition-colors duration-200 hover:text-red-main">
            Accueil
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          {selectedSubcategory?.parent && <><Link to={`/categorie-parent/${selectedSubcategory.parent.slug}`} className="transition-colors duration-200 hover:text-red-main">{selectedSubcategory.parent.name}</Link><ChevronRight size={14} aria-hidden="true" /></>}
          <span>{pageCategoryLabel}</span>
        </nav>

        <div className="mb-6 flex flex-col gap-4 lg:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <SectionTitle
              title={pageCategoryLabel}
             
              accentWord={pageCategoryLabel}
              color="orange"
            />

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-border bg-white px-4 py-2 text-sm font-medium text-black-text transition-colors duration-200 hover:border-red-main hover:text-red-main lg:hidden"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filtres
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-[260px] shrink-0 lg:block">{filtersPanel}</aside>

          <div className="min-w-0 flex-1">
            {loading && (
              <p className="text-center text-sm text-gray-text">Chargement...</p>
            )}

            {!loading && error && (
              <p className="text-center text-sm text-gray-text">{error}</p>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-border bg-white px-6 text-center">
                <SearchX size={34} className="text-red-main" aria-hidden="true" />
                <p className="mt-4 text-base font-medium text-black-text">
                  Aucun produit ne correspond à votre recherche.
                </p>
                <p className="mt-2 max-w-md text-sm text-gray-text">
                  Ajustez vos filtres pour afficher davantage de produits disponibles dans cette
                  categorie.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Fermer les filtres"
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            <motion.div
              className="absolute left-0 top-0 h-full w-full max-w-[360px] bg-off-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {filtersPanel}
              <div className="border-t border-gray-border px-5 py-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
                >
                  <FilterX size={16} aria-hidden="true" />
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default CategoryPage
