import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import SectionTitle from './SectionTitle'
import { fetchProducts } from '../utils/api'
import { mapProductsFromApi } from '../utils/productMapper'

function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function ProductsGrid() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchProducts()
      .then(({ data }) => {
        const mapped = mapProductsFromApi(data)
        const activeProducts = mapped.filter((product) => product.isActive !== false)
        const promoProducts = activeProducts.filter((product) => product.oldPriceValue != null)
        const source = promoProducts.length > 0 ? promoProducts : shuffleArray(activeProducts)
        setProducts(source.slice(0, 8))
      })
      .catch(() => {
        setProducts([])
        setError('Impossible de charger les produits.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 rounded-2xl border border-red-main/20 bg-gradient-to-r from-red-light/70 to-white px-4 py-5 sm:px-6">
        <SectionTitle
          title="Offres exclusives à ne pas manquer"
          accentWord="exclusives"
          subtitle="Découvrez les créations marocaines les plus plébiscitées, à prix imbattables."
          align="left"
        />

        <Link
          to="/categorie/tout"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-main px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-dark"
        >
          Voir plus d'offres
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </header>

      {loading && (
        <p className="text-center text-sm text-gray-text">Chargement...</p>
      )}

      {!loading && error && (
        <p className="text-center text-sm text-gray-text">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="h-full min-w-0"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductsGrid
