import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCategories } from '../utils/api'

function CategoriesGrid() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchCategories()
      .then(({ data }) => setCategories((data || []).filter((category) => category.isActive !== false)))
      .catch(() => {
        setCategories([])
        setError('Impossible de charger les catégories.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto w-full max-w-[1280px] py-4">
<header className="mb-8 flex flex-col items-center px-4 text-center sm:px-6 lg:px-8">
  <h2 className="max-w-4xl text-3xl font-black leading-tight text-black-text sm:text-4xl lg:text-4xl">
    Explorez par catégorie
  </h2>

  <div
    className="mx-auto mt-3 h-[5px] w-[72px] rounded-full bg-gradient-to-r from-blue-accent to-green-accent"
    aria-hidden="true"
  />

</header>
      <div className="hide-scrollbar flex gap-5 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {loading && (
          <p className="px-4 text-sm text-gray-text">Chargement...</p>
        )}

        {!loading && error && (
          <p className="px-4 text-sm text-gray-text">{error}</p>
        )}

        {!loading &&
          categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => navigate(`/categorie/${category.slug}`)}
            className="group flex w-[90px] shrink-0 flex-col items-center"
          >
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-[90px] w-[90px] rounded-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                loading="lazy"
              />
            ) : (
              <span className="flex h-[90px] w-[90px] items-center justify-center rounded-full bg-gray-bg px-2 text-center text-xs text-gray-text">
                {category.name}
              </span>
            )}
            <span className="mt-2 text-center text-[13px] font-semibold leading-tight text-black-text">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default CategoriesGrid
