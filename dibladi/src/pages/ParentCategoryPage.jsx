import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SectionTitle from '../components/SectionTitle'
import { fetchParentCategories, fetchParentCategoryCategories, fetchProducts } from '../utils/api'
import { mapProductsFromApi } from '../utils/productMapper'

function ParentCategoryPage() {
  const { slug } = useParams()
  const [parent, setParent] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setSelectedSlug(null)

    Promise.all([
      fetchParentCategories(),
      fetchParentCategoryCategories(slug),
      fetchProducts({ parentCategorySlug: slug }),
    ])
      .then(([parents, categories, productsResponse]) => {
        if (cancelled) return
        setParent((parents || []).find((item) => item.slug === slug) || null)
        setSubcategories(Array.isArray(categories) ? categories : [])
        setProducts(mapProductsFromApi(productsResponse.data))
      })
      .catch(() => {
        if (!cancelled) {
          setParent(null)
          setSubcategories([])
          setProducts([])
          setError('Impossible de charger cette grande catégorie.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const visibleProducts = useMemo(
    () => selectedSlug ? products.filter((product) => product.category === selectedSlug) : products,
    [products, selectedSlug],
  )

  const parentName = parent?.name || slug?.replaceAll('-', ' ')

  if (loading) {
    return <main className="min-h-[60vh] bg-off-white px-4 py-12 text-center text-sm text-gray-text">Chargement...</main>
  }

  if (error) {
    return <main className="min-h-[60vh] bg-off-white px-4 py-12 text-center text-sm text-gray-text">{error}</main>
  }

  return (
    <main className="bg-off-white px-4 py-8 text-black-text sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-text">
          <Link to="/" className="hover:text-red-main">Accueil</Link>
          <span>/</span>
          <span className="text-black-text">{parentName}</span>
        </nav>

        <section className="mb-10">
          <SectionTitle title={parentName} accentWord={parentName} color="orange" />
          <div className="hide-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">
            <button type="button" onClick={() => setSelectedSlug(null)} className={`group flex w-[92px] shrink-0 flex-col items-center ${selectedSlug === null ? 'text-red-main' : ''}`}>
              <span className={`flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 bg-white text-center text-xs font-bold ${selectedSlug === null ? 'border-red-main' : 'border-gray-border'}`}>Toutes</span>
              <span className="mt-2 text-center text-[13px] font-semibold">Toutes</span>
            </button>
            {subcategories.map((category) => (
              <button key={category.id} type="button" onClick={() => setSelectedSlug(category.slug)} className={`group flex w-[92px] shrink-0 flex-col items-center ${selectedSlug === category.slug ? 'text-red-main' : ''}`}>
                <span className={`h-[90px] w-[90px] overflow-hidden rounded-full border-2 bg-white ${selectedSlug === category.slug ? 'border-red-main' : 'border-gray-border'}`}>
                  {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" /> : <span className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-text">{category.name}</span>}
                </span>
                <span className="mt-2 text-center text-[13px] font-semibold leading-tight">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-black-text">{selectedSlug ? subcategories.find((item) => item.slug === selectedSlug)?.name : `Produits ${parentName}`}</h2>
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product) => <ProductCard key={product.id} {...product} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-border bg-white px-6 py-16 text-center text-sm text-gray-text">Aucun produit dans cette catégorie.</div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ParentCategoryPage
