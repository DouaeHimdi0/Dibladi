import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { fetchProducts, fetchVendors } from '../utils/api'
import { getBrandTypography, slugifyBrandName } from '../utils/brandStyles'
import { mapProductsFromApi } from '../utils/productMapper'
import { API_BASE_URL } from '../config/api'

function resolveVendorImageUrl(imageUrl) {
  if (!imageUrl) {
    return ''
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

function BrandPage() {
  const { slug, vendeurId } = useParams()
  const [products, setProducts] = useState([])
  const [brandVendor, setBrandVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const brand = useMemo(() => {
    const typography = getBrandTypography(slug ?? '')
    return {
      slug,
      name: typography.display ?? slug?.replace(/-/g, ' '),
      className: typography.className,
    }
  }, [slug])

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchVendors()
      .then(async (vendorsResponse) => {
        const vendors = Array.isArray(vendorsResponse.data) ? vendorsResponse.data : []
        const matchingVendor = vendeurId
          ? vendors.find((vendor) => String(vendor.id) === String(vendeurId))
          : vendors.find((vendor) => slugifyBrandName(vendor.shopName) === slug)

        setBrandVendor(matchingVendor ?? null)

        const productsResponse = await fetchProducts({
          brand: slugifyBrandName(matchingVendor?.shopName || slug || ''),
        })
        setProducts(mapProductsFromApi(productsResponse.data))
      })
      .catch(() => {
        setProducts([])
        setBrandVendor(null)
        setError('Impossible de charger les produits de cette marque.')
      })
      .finally(() => setLoading(false))
  }, [slug, vendeurId])

  const brandProducts = useMemo(() => products, [products])
  const vendorImageUrl = resolveVendorImageUrl(brandVendor?.photoUrl)
  const displayBrandName = brandVendor?.shopName || brand.name || 'Boutique'

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        {vendorImageUrl ? (
          <div className="mb-5 flex justify-center">
            <img
              src={vendorImageUrl}
              alt={brand.name}
              className="h-24 w-24 rounded-full border border-gray-border object-cover"
            />
          </div>
        ) : (
          <div className="mb-5 flex justify-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-border bg-gray-bg text-lg font-semibold text-gray-text">
              {brand.name?.slice(0, 2).toUpperCase() || 'BD'}
            </span>
          </div>
        )}
        <p className={`text-3xl sm:text-4xl ${brand.className}`}>{displayBrandName}</p>
        <p className="mt-4 text-sm text-gray-text sm:text-[15px]">
          Découvrez tous les produits {displayBrandName} sur DiblaDi
        </p>
      </header>

      {loading && (
        <p className="text-center text-sm text-gray-text">Chargement...</p>
      )}

      {!loading && error && (
        <p className="text-center text-sm text-gray-text">{error}</p>
      )}

      {!loading && !error && brandProducts.length === 0 ? (
        <div className="rounded-2xl border border-gray-border bg-white p-10 text-center">
          <p className="text-gray-text">
            Aucun produit {brand.name} n&apos;est disponible pour le moment.
          </p>
          <Link
            to="/categorie/tout"
            className="mt-6 inline-flex rounded-lg border border-red-main px-6 py-3 text-sm font-semibold text-red-main transition-colors hover:bg-red-light"
          >
            Explorer toutes les offres
          </Link>
        </div>
      ) : !loading && !error ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brandProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      ) : null}
    </main>
  )
}

export default BrandPage
