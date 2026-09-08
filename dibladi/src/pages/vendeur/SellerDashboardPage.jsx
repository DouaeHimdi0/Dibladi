import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Plus, Settings, Star, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'
import SellerProductCard from '../../components/vendeur/SellerProductCard'
import useAuth from '../../hooks/useAuth'
import api, { deleteProduct } from '../../utils/api'
import {
  DEMO_SHOP_NAME,
} from '../../utils/sellerHelpers'

function SellerScore({ score }) {
  const filledStars = Math.round((score / 100) * 5)

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-text">
      <span className="font-medium text-black-text">{score}/100</span>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < filledStars

          return (
            <Star
              key={`seller-score-${index}`}
              size={14}
              className={isFilled ? 'text-red-main' : 'text-gray-border'}
              fill={isFilled ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          )
        })}
      </div>
    </div>
  )
}

function SellerDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const [showSuccessBanner, setShowSuccessBanner] = useState(
    Boolean(location.state?.productSuccess),
  )
  const [sellerProducts, setSellerProducts] = useState([])
  const [sellerScore, setSellerScore] = useState(0)
  const [hasBankInformation, setHasBankInformation] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')

  const sellerName = currentUser?.name?.trim() || 'Nom Vendeur'
  const successMessage = location.state?.message || 'Produit publié avec succès'

  const loadProducts = useMemo(
    () => async () => {
      setLoadingProducts(true)
      setProductsError('')

      try {
        const [{ data: productsData }, { data: profileData }] = await Promise.all([
          api.get('/api/products/vendor/me'),
          api.get('/api/vendors/me'),
        ])
        setSellerProducts(Array.isArray(productsData) ? productsData : [])
        setSellerScore(Number(profileData?.score ?? 0))
        setHasBankInformation(Boolean(profileData?.bankAccountHolderName && profileData?.bankName && profileData?.bankRib))
      } catch (error) {
        setSellerProducts([])
        setProductsError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            'Impossible de charger vos produits.',
        )
      } finally {
        setLoadingProducts(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (!showSuccessBanner) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setShowSuccessBanner(false)
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [showSuccessBanner])

  useEffect(() => {
    if (location.state?.productSuccess) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  function handleSettingsClick() {
    navigate('/vendeur/parametres')
  }

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm('Supprimer ce produit ? Cette action est définitive.')
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(productId)
      await loadProducts()
    } catch (error) {
      setProductsError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de supprimer ce produit.',
      )
    }
  }

  return (
    <main className="min-h-screen bg-off-white text-black-text">
      <header className="border-b border-gray-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo className="shrink-0" textClassName="brand-logo text-[24px] text-red-main" />
            <span className="text-[18px] font-bold leading-none text-black-text">Espace vendeur</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main sm:inline"
            >
              Retour à la boutique
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
            >
              <LogOut size={16} aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="border-b border-red-main/20 bg-red-light"
          >
            <div className="mx-auto max-w-[1280px] px-4 py-3 text-sm font-medium text-red-main sm:px-6 lg:px-8">
              {successMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              {currentUser?.picture ? (
                <img
                  src={currentUser.picture}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full border border-gray-border object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-bg text-gray-text">
                  <User size={28} aria-hidden="true" />
                </span>
              )}

              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-bold text-black-text">{sellerName}</h1>
                <p className="text-sm text-gray-text">{DEMO_SHOP_NAME}</p>
                <SellerScore score={sellerScore} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/vendeur/produits/ajouter')}
                className="inline-flex items-center gap-2 rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
              >
                <Plus size={16} aria-hidden="true" />
                Ajouter un produit
              </button>
              <button
                type="button"
                onClick={handleSettingsClick}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-border bg-white px-4 py-2.5 text-sm font-medium text-black-text transition-colors duration-200 hover:bg-gray-bg"
              >
                <Settings size={16} aria-hidden="true" />
                Paramètres
              </button>
            </div>
          </div>
        </section>

        {!hasBankInformation && (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">⚠️ Ajoutez vos informations bancaires</p>
              <p className="mt-1 text-sm">En cas de vente, votre commission sera envoyée sur ce compte.</p>
            </div>
            <button type="button" onClick={() => navigate('/vendeur/parametres?section=informations-personnelles')} className="shrink-0 rounded-lg bg-red-main px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-dark">
              Ajouter maintenant
            </button>
          </section>
        )}

        {hasBankInformation && (
          <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
            <p className="font-semibold">Coordonnées bancaires ajoutées ✓</p>
            <button type="button" onClick={() => navigate('/vendeur/parametres?section=informations-personnelles')} className="mt-2 text-sm font-medium underline hover:no-underline">
              Modifier si vous le souhaitez
            </button>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-black-text">Mes produits</h2>
            <span className="text-sm text-gray-text">{sellerProducts.length} produit(s)</span>
          </div>

          {loadingProducts && <p className="mb-4 text-sm text-gray-text">Chargement de vos produits...</p>}
          {!loadingProducts && productsError && (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">
              {productsError}
            </p>
          )}

          {!loadingProducts && sellerProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-border bg-white px-6 py-14 text-center">
              <p className="text-sm text-gray-text">Vous n&apos;avez pas encore de produit publié.</p>
              <button
                type="button"
                onClick={() => navigate('/vendeur/produits/ajouter')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
              >
                <Plus size={16} aria-hidden="true" />
                Ajouter un produit
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {sellerProducts.map((product) => (
                <SellerProductCard
                  key={product.id}
                  product={product}
                  onEdit={(productId) => navigate(`/vendeur/produits/modifier/${productId}`)}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </main>
  )
}

export default SellerDashboardPage
