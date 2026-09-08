import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionTitle from './SectionTitle'
import { fetchVendors } from '../utils/api'
import { mapBrandFromApi } from '../utils/brandStyles'

function BrandsBar() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchVendors()
      .then(({ data }) => {
        const mapped = Array.isArray(data)
          ? data
              .filter((vendor) => vendor?.shopName)
              .map((vendor) => ({
                id: vendor.id,
                name: vendor.shopName,
                slug: vendor.shopName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `vendor-${vendor.id}`,
                fontStyle: 'sans-bold',
              }))
              .map(mapBrandFromApi)
              .filter(Boolean)
          : []

        setBrands(mapped)
      })
      .catch(() => {
        setBrands([])
        setError('Impossible de charger les marques partenaires.')
      })
      .finally(() => setLoading(false))
  }, [])

  const duplicatedBrands = useMemo(() => [...brands, ...brands], [brands])

  return (
    <section className="border-y border-gray-border bg-white py-6">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <SectionTitle
            title="Nos marques partenaires"
            subtitle="Des labels et créateurs marocains qui font vivre la marketplace."
            align="center"
            color="blue"
          />
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-text">Chargement...</p>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-gray-text">{error}</p>
        )}

        {!loading && !error && brands.length === 0 && (
          <p className="text-center text-sm text-gray-text">Aucune marque disponible pour le moment.</p>
        )}

        {!loading && brands.length > 0 && (
          <div className="brands-marquee">
            <div className="brands-track">
              {duplicatedBrands.map((brand, index) => (
                <div key={`${brand.slug}-${index}`} className="flex items-center px-2">
<Link
  to={`/marque/${brand.slug}`}
  className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-white px-6 py-3 transition-all duration-200 hover:scale-105 hover:border-red-main hover:shadow-[0_4px_14px_rgba(253,62,62,0.18)]"
>
  <span className={`whitespace-nowrap leading-none ${brand.className}`}>
    {brand.name}
  </span>
</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BrandsBar
