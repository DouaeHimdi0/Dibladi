import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Star, Pencil, Check, X, Trash2, MessageSquare } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionTitle from '../components/SectionTitle'
import { createReview, fetchProductById, fetchProductVariants, fetchReviewsByProduct, fetchCurrentVendorProfile, updateProduct, replyToReview, deleteReview } from '../utils/api'
import { mapProductDetailFromApi, formatMadPrice } from '../utils/productMapper'
import useCart from '../hooks/useCart'
import useAuth from '../hooks/useAuth'
import { USER_ROLES } from '../context/AuthContext'

function formatCategoryLabel(value) {
  if (!value) {
    return 'Categorie'
  }

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function renderStars(rating) {
  return [...Array(5)].map((_, index) => {
    const isFilled = index < Math.round(rating)

    return (
      <Star
        key={`star-${index}`}
        size={14}
        className={isFilled ? 'fill-yellow-accent text-yellow-accent' : 'text-gray-border'}
        fill={isFilled ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    )
  })
}

function parseCombination(combinationLabel) {
  if (!combinationLabel) {
    return {}
  }

  try {
    return JSON.parse(combinationLabel) || {}
  } catch {
    return {}
  }
}

function parseVariant(variant) {
  const attributes = parseCombination(variant?.combinationLabel)
  return attributes.type === 'simple' ? null : attributes
}

const ATTRIBUTE_ARABIC_LABELS = {
  couleur: '(اللون)',
  taille: '(المقاس)',
  pointure: '(المقاس)',
  matiere: '(المادة)',
  matière: '(المادة)',
  format: '(الحجم)',
  contenance: '(الحجم)',
  genre: '(الجنس)',
  teinte: '(اللون)',
}

function formatAttributeLabel(key) {
  const label = key.charAt(0).toUpperCase() + key.slice(1)
  return `${label} ${ATTRIBUTE_ARABIC_LABELS[key.toLowerCase()] || ''}`.trim()
}

function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const commentsRef = useRef(null)
  const { currentUser } = useAuth()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const { addToCart } = useCart()
  const isClient = currentUser?.role === USER_ROLES.CLIENT

  const [vendorProfile, setVendorProfile] = useState(null)
  const isOwnerVendor = Boolean(vendorProfile && product && vendorProfile.id === product.sellerId)

  // Edit states
  const [editingField, setEditingField] = useState(null)
  const [editValues, setEditValues] = useState({ name: '', price: '', description: '', stockQuantity: '' })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Review vendor actions states
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    setActiveImageIndex(0)
    setQuantity(1)
    setIsFavorite(false)
    setIsAdded(false)
    setLoading(true)
    setError(null)
    setVariants([])
    setSelectedAttributes({})
    setReviews([])
    setReviewsError('')
    setReviewMessage('')

      async function loadProduct() {
        try {
          setLoading(true)
          const { data } = await fetchProductById(id)
          setProduct(mapProductDetailFromApi(data))

          try {
            const variantData = await fetchProductVariants(id)
            setVariants(Array.isArray(variantData) ? variantData : data.variants || [])
          } catch (variantError) {
            console.error('Erreur chargement variants:', variantError.response?.data)
            setVariants(Array.isArray(data.variants) ? data.variants : [])
          }
        } catch (loadError) {
          console.error('Erreur chargement produit:', loadError)
          setProduct(null)
          setError('Produit introuvable ou erreur de chargement')
        } finally {
          setLoading(false)
        }
      }

      loadProduct()

    if (currentUser?.role === USER_ROLES.VENDOR) {
      fetchCurrentVendorProfile()
        .then(({ data }) => setVendorProfile(data))
        .catch(() => setVendorProfile(null))
    }
  }, [id, currentUser])

  useEffect(() => {
    if (!id) {
      return undefined
    }

    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError('')

      try {
        const { data } = await fetchReviewsByProduct(id)
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        setReviews(list)
      } catch (error) {
        setReviews([])
        setReviewsError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            'Le service d’avis n’est pas encore disponible côté backend.',
        )
      } finally {
        setReviewsLoading(false)
      }
    }

    loadReviews()
  }, [id])

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

  if (loading) {
    return (
      <main className="bg-off-white px-4 py-12 text-black-text sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#B30808]/20 border-t-[#B30808]" aria-label="Chargement" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="bg-off-white px-4 py-12 text-black-text sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-gray-border bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-black-text">Produit introuvable</p>
          <p className="mt-2 max-w-md text-sm text-gray-text">
            {error}
          </p>
          <button type="button" onClick={() => navigate(-1)} className="mt-6 rounded-md bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark">
            Retour
          </button>
        </div>
      </main>
    )
  }

  const images = product.images || (product.imageUrl ? [product.imageUrl] : [])
  const activeImage = images[activeImageIndex] || product.image || ''
  const productVariants = variants.length > 0 ? variants : (product.variants || [])
  const hasVariants = productVariants.length > 0 && !productVariants.every((variant) => parseCombination(variant?.combinationLabel).type === 'simple')
  const parsedVariants = hasVariants ? productVariants.map((variant) => ({ ...variant, attributes: parseVariant(variant) })).filter((variant) => variant.attributes) : []
  const attributeKeys = [...new Set(parsedVariants.flatMap((variant) => Object.keys(variant.attributes)))]
  const selectedVariant = parsedVariants.find((variant) => attributeKeys.every((key) => variant.attributes[key] === selectedAttributes[key]))
  const availableVariantValues = (key) => [...new Set(parsedVariants.map((variant) => variant.attributes[key]).filter(Boolean))]
  const isValueAvailable = (attributeKey, attributeValue) => parsedVariants.some((variant) => {
    if (!variant.isAvailable || Number(variant.stockQuantity || 0) <= 0 || variant.attributes[attributeKey] !== attributeValue) {
      return false
    }
    return Object.entries(selectedAttributes).every(([key, value]) => key === attributeKey || variant.attributes[key] === value)
  })
  const maxQuantity = selectedVariant ? Number(selectedVariant.stockQuantity || 0) : parsedVariants.length ? 0 : (product.inStock ? product.stockQuantity : 0)
  const selectedQuantity = maxQuantity > 0 ? Math.min(quantity, maxQuantity) : 0
  const normalizedReviews = Array.isArray(reviews) && reviews.length > 0 ? reviews : product.reviews ?? []
  const reviewsCount = normalizedReviews.length || product.reviewsCount || 0
  const categoryLabel = product.subcategoryName || formatCategoryLabel(product.category)
  const displayPrice = selectedVariant ? formatMadPrice(selectedVariant.price) : parsedVariants.length ? ` ${formatMadPrice(Math.min(...parsedVariants.map((variant) => Number(variant.price))))}` : product.price
  const deliveryFeeText = formatMadPrice(product.deliveryFeeValue ?? 30)
  const shopName = product.sellerShopName || product.vendorShopName || product.sellerName || 'Boutique DiblaDi'
  const technicalAttributes = attributeKeys.map((key) => ({ key, values: availableVariantValues(key) }))
  const description =
    product.description ||
    `${product.name} est une piece selectionnee pour DiblaDi, pensee pour offrir un rendu premium, une finition soignee et une experience authentique a travers des savoir-faire marocains.`

  function handleReviewChange(event) {
    const { name, value } = event.target

    setReviewForm((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmitReview(event) {
    event.preventDefault()

    if (!currentUser?.token) {
      setReviewMessage('Connectez-vous pour laisser un avis.')
      return
    }

    const comment = reviewForm.comment.trim()

    if (!comment) {
      setReviewMessage('Le commentaire est obligatoire.')
      return
    }

    try {
      setReviewSubmitting(true)
      setReviewMessage('')

      await createReview({
        productId: Number(id),
        rating: Number(reviewForm.rating),
        comment,
      })

      setReviewForm({ rating: 5, comment: '' })
      setReviewMessage('Votre avis a bien été envoyé.')

      const { data } = await fetchReviewsByProduct(id)
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
      setReviews(list)
    } catch (error) {
      setReviewMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible d’envoyer votre avis pour le moment.',
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleSaveEdit(field) {
    setIsSavingEdit(true)
    try {
      const payload = {
        name: field === 'name' ? editValues.name : product.name,
        description: field === 'description' ? editValues.description : product.description,
        price: field === 'price' ? Number(editValues.price) : product.priceValue,
        stockQuantity: field === 'stockQuantity' ? Number(editValues.stockQuantity) : product.stockQuantity,
        categoryId: product.categoryId,
        images: product.images,
      }
      
      const { data } = await updateProduct(product.id, payload)
      setProduct(mapProductDetailFromApi(data))
      setEditingField(null)
    } catch (err) {
      alert("Erreur lors de la sauvegarde")
    } finally {
      setIsSavingEdit(false)
    }
  }

  function startEdit(field, currentValue) {
    setEditValues(prev => ({ ...prev, [field]: currentValue }))
    setEditingField(field)
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return
    try {
      await deleteReview(reviewId)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      alert("Erreur lors de la suppression: " + msg)
    }
  }

  async function handleReplyReview(reviewId) {
    if (!replyText.trim()) return
    try {
      const { data } = await replyToReview(reviewId, replyText)
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, vendorReply: data.vendorReply } : r))
      setReplyingTo(null)
      setReplyText('')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      alert("Erreur lors de la réponse: " + msg)
    }
  }

  function handleQuantityChange(value) {
    if (maxQuantity === 0) {
      setQuantity(0)
      return
    }

    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) {
      setQuantity(1)
      return
    }

    const boundedValue = Math.min(Math.max(numericValue, 1), maxQuantity)
    setQuantity(boundedValue)
  }

  function handleDecrement() {
    if (selectedQuantity > 1) {
      setQuantity((currentQuantity) => currentQuantity - 1)
    }
  }

  function handleIncrement() {
    if (selectedQuantity < maxQuantity) {
      setQuantity((currentQuantity) => currentQuantity + 1)
    }
  }

  return (
    <main className="bg-off-white px-4 py-8 text-black-text sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[14px] text-gray-text">
          <Link to="/" className="transition-colors duration-200 hover:text-red-main">
            Accueil
          </Link>
          <span>/</span>
          <Link
            to={`/categorie/${product.subcategorySlug || product.category}`}
            className="transition-colors duration-200 hover:text-red-main"
          >
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-black-text">{product.name}</span>
        </nav>

        <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start md:gap-6">
          <motion.section
            className="min-w-0 flex-1 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:gap-6">
              <div className="order-2 flex w-full shrink-0 flex-row gap-2 overflow-x-auto md:order-1 md:w-[90px] md:flex-col md:gap-[10px] md:overflow-visible">
              {images.slice(0, 4).map((image, index) => {
                const isActive = index === activeImageIndex

                return (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-[6px] border-2 bg-gray-bg transition-colors duration-200 ${
                      isActive ? 'border-[#B30808]' : 'border-[#E0E0E0] hover:border-[#B30808]'
                    }`}
                  >
                    <div className="aspect-square w-full">
                      <img
                        src={image}
                        alt={`${product.name} vue ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </button>
                )
              })}
              </div>
              <div className="order-1 relative min-w-0 flex-1 aspect-square overflow-hidden rounded-[10px] bg-[#F5F5F5] md:order-2 md:aspect-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="h-full min-h-0 w-full bg-[#F5F5F5] md:h-[480px]"
                  >
                    {activeImage ? <img src={activeImage} alt={product.name} className="h-full w-full object-contain" /> : <div className="flex h-full w-full items-center justify-center text-sm text-gray-text">Image produit</div>}
                  </motion.div>
                </AnimatePresence>
                {images.length > 1 && <><button type="button" onClick={() => setActiveImageIndex((current) => (current - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]" aria-label="Photo précédente"><ChevronLeft size={20} className="text-[#B30808]" /></button><button type="button" onClick={() => setActiveImageIndex((current) => (current + 1) % images.length)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]" aria-label="Photo suivante"><ChevronRight size={20} className="text-[#B30808]" /></button></>}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="w-full shrink-0 space-y-5 rounded-[10px] bg-white p-0 md:w-[360px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
          >
            <div>
              <p className="text-sm text-gray-text">{categoryLabel}</p>
              
              {editingField === 'name' ? (
                <div className="mt-2 flex items-center gap-2">
                  <input type="text" value={editValues.name} onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))} className="flex-1 rounded border border-gray-border p-2 text-xl font-bold outline-none focus:border-red-main" />
                  <button onClick={() => handleSaveEdit('name')} disabled={isSavingEdit} className="rounded bg-green-500 p-2 text-white hover:bg-green-600"><Check size={18}/></button>
                  <button onClick={() => setEditingField(null)} disabled={isSavingEdit} className="rounded bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"><X size={18}/></button>
                </div>
              ) : (
                <div className="mt-2 flex items-start justify-between group">
                  <h1 className="text-2xl font-bold leading-tight text-black-text sm:text-[2rem]">{product.name}</h1>
                  {isOwnerVendor && (
                    <button onClick={() => startEdit('name', product.name)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-main transition-opacity"><Pencil size={18}/></button>
                  )}
                </div>
              )}
            </div>

            <button type="button" onClick={() => navigate(`/boutique/${product.vendorId}`)} className="mb-3 text-left text-sm text-[#4A4A4A]">Vendu par : <span className="font-semibold text-[#B30808] hover:underline">{shopName}</span></button>

            <button
              type="button"
              onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex flex-wrap items-center gap-2 text-sm transition-colors duration-200 hover:text-red-main"
            >
              <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
              <span className="text-gray-text">{product.rating.toFixed(1)}</span>
              <span className="text-gray-text">({reviewsCount} avis)</span>
            </button>

            {editingField === 'price' ? (
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={editValues.price} onChange={e => setEditValues(p => ({ ...p, price: e.target.value }))} className="w-32 rounded border border-gray-border p-2 text-xl font-bold outline-none focus:border-red-main" />
                <span className="font-bold">MAD</span>
                <button onClick={() => handleSaveEdit('price')} disabled={isSavingEdit} className="rounded bg-green-500 p-2 text-white hover:bg-green-600"><Check size={18}/></button>
                <button onClick={() => setEditingField(null)} disabled={isSavingEdit} className="rounded bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"><X size={18}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <p className="w-full rounded-md bg-red-main/10 px-3 py-2 text-center text-[30px] font-bold leading-tight text-red-main">{displayPrice}</p>
                {isOwnerVendor && (
                  <button onClick={() => startEdit('price', product.priceValue)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-main transition-opacity"><Pencil size={18}/></button>
                )}
              </div>
            )}



            


            <div className="space-y-3">
              {attributeKeys.length > 0 && <div className="space-y-4">{attributeKeys.map((key) => <div key={key}><p className="mb-2 flex items-center gap-2 text-sm font-bold capitalize text-[#1A1A1A]"><span className="h-2 w-2 rounded-full bg-red-main" aria-hidden="true" />{key}</p><div className="flex flex-wrap gap-2">{availableVariantValues(key).map((value) => { const available = isValueAvailable(key, value); const selected = selectedAttributes[key] === value; return <button key={value} type="button" disabled={!available} onClick={() => setSelectedAttributes((current) => ({ ...current, [key]: value }))} className={`rounded-lg border px-3 py-2 text-sm ${selected ? 'border-red-main bg-red-main text-white' : available ? 'border-red-main text-red-main' : 'border-gray-border text-gray-text opacity-35 line-through cursor-not-allowed pointer-events-none'}`}>{value}</button> })}</div></div>)}</div>}
              <p className="mb-2 flex items-center gap-2 text-sm font-bold capitalize text-[#1A1A1A]">
  <span className="h-2 w-2 rounded-full bg-red-main" aria-hidden="true" />
  Quantité
</p>
              <div className="flex w-full max-w-[180px] items-center overflow-hidden rounded-lg border border-gray-border bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={selectedQuantity <= 1 || maxQuantity === 0}
                  className="flex h-11 w-11 items-center justify-center text-lg text-gray-text transition-colors duration-200 hover:text-red-main disabled:cursor-not-allowed disabled:opacity-40"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity || 1}
                  value={selectedQuantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  disabled={maxQuantity === 0}
                  className="h-11 w-full border-x border-gray-border text-center text-sm text-black-text outline-none"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={selectedQuantity >= maxQuantity || maxQuantity === 0}
                  className="flex h-11 w-11 items-center justify-center text-lg text-gray-text transition-colors duration-200 hover:text-red-main disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
<span
  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
    maxQuantity > 0
      ? 'bg-green-accent/10 text-green-accent'
      : 'bg-gray-bg text-gray-text'
  }`}
>
  {maxQuantity > 0 ? 'En stock' : 'Rupture de stock'}
</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!product.inStock || (parsedVariants.length > 0 && (!selectedVariant || !selectedVariant.isAvailable))}
                onClick={() => {
                  if (!product.inStock || selectedQuantity <= 0) {
                    return
                  }

                  addToCart(
                    {
                      id: product.id,
                      name: product.name,
                      image: product.imageUrl ?? product.images?.[0] ?? product.image ?? '',
                      price: Number(selectedVariant?.price ?? product.priceValue ?? product.price ?? 0),
                      priceValue: Number(selectedVariant?.price ?? product.priceValue ?? product.price ?? 0),
                      deliveryFee: 40,
                      deliveryFeeValue: 40,
                      vendorId: Number(product.vendorId),
                      sellerId: Number(product.vendorId),
                      variantId: selectedVariant?.id ?? null,
                      variantLabel: selectedVariant?.combinationLabel ?? null,
                    },
                    selectedQuantity,
                  )
                  setIsAdded(true)
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-gray-border disabled:text-gray-text"
              >
                <ShoppingCart size={16} aria-hidden="true" />
                {isAdded ? 'Ajouté ✓' : 'Ajouter au panier'}
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite((currentFavorite) => !currentFavorite)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-border bg-white transition-colors duration-200 hover:border-red-main hover:text-red-main"
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
          </motion.section>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-[#E0E0E0] bg-white md:grid-cols-2">
          <div className="border-b border-[#E0E0E0] p-6 md:border-b-0 md:border-r"><h2 className="text-base font-bold text-[#1A1A1A]">Description du produit</h2><div className="mt-1.5 mb-4 h-0.5 w-[60px] bg-[#B30808]" /><p className="text-sm leading-[1.8] text-[#1A1A1A]">{description}</p></div>
          <div className="p-6"><h2 className="text-base font-bold text-[#1A1A1A]">Fiche Technique</h2><div className="mt-1.5 mb-4 h-0.5 w-[60px] bg-[#B30808]" /><dl className="overflow-hidden text-sm">{[{ label: 'Marque', value: shopName }, { label: 'Type de produit', value: categoryLabel }, ...technicalAttributes.map(({ key, values }) => ({ label: formatAttributeLabel(key), value: values.join(', ') })), { label: 'Livraison', value: 'Toutes les villes du Maroc' }].map((row, index) => <div key={row.label} className={`flex border-b border-[#F0E8E8] ${index % 2 === 0 ? 'bg-[#FFF8F8]' : 'bg-white'}`}><dt className="w-[45%] px-3 py-2.5 text-[13px] font-medium text-[#B30808]">{row.label}</dt><dd className="flex-1 px-3 py-2.5 text-sm text-[#1A1A1A]">{row.value}</dd></div>)}</dl></div>
        </section>

        <section ref={commentsRef} className="mt-12">
          <SectionTitle
            title="Avis clients"
            subtitle={`${reviewsCount} avis sur ce produit`}
            color="green"
          />

          {reviewsLoading && (
            <p className="mt-4 text-sm text-gray-text">Chargement des avis...</p>
          )}

          {!reviewsLoading && reviewsError && (
            <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">
              {reviewsError}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {normalizedReviews.map((review) => (
              <article
                key={review.id ?? `${review.name}-${review.date}-${review.comment}`}
                className="rounded-xl border border-gray-border bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-black-text">{review.name || review.clientName || 'Client'}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-text">
                      <div className="flex items-center gap-1">
                        {renderStars(Number(review.rating ?? 0))}
                      </div>
                      <span>{review.date || review.createdAt || ''}</span>
                    </div>
                  </div>
                  {isOwnerVendor && (
                    <div className="flex gap-2">
                      {!review.vendorReply && (
                        <button onClick={() => setReplyingTo(review.id)} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
                          <MessageSquare size={14} /> Répondre
                        </button>
                      )}
                      <button onClick={() => handleDeleteReview(review.id)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700">
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm leading-7 text-gray-text">{review.comment}</p>
                
                {review.vendorReply && (
                  <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4 relative">
                    <p className="text-xs font-semibold text-black-text mb-1 flex items-center gap-1">
                      <MessageSquare size={12} className="text-gray-500" /> Réponse du vendeur
                    </p>
                    <p className="text-sm text-gray-700 italic">{review.vendorReply}</p>
                  </div>
                )}

                {replyingTo === review.id && (
                  <div className="mt-4 space-y-2 rounded-lg bg-blue-50 p-3 border border-blue-100">
                    <textarea 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      rows={2}
                      placeholder="Votre réponse..."
                      className="w-full text-sm p-2 rounded border border-blue-200 outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="text-xs px-3 py-1.5 rounded text-gray-600 hover:bg-gray-200">Annuler</button>
                      <button onClick={() => handleReplyReview(review.id)} className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">Envoyer la réponse</button>
                    </div>
                  </div>
                )}
              </article>
            ))}

            {!reviewsLoading && normalizedReviews.length === 0 && !reviewsError && (
              <p className="rounded-xl border border-dashed border-gray-border bg-white px-4 py-6 text-sm text-gray-text">
                Aucun avis n’a encore été publié pour ce produit.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-gray-border bg-white p-5">
            {isClient ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-black-text">Laisser un avis</p>
                  <p className="mt-1 text-sm text-gray-text">
                    Partagez votre retour sur ce produit.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-text">Note</label>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewForm((currentValues) => ({ ...currentValues, rating: value }))}
                        className="text-yellow-accent transition-transform duration-200 hover:scale-110"
                        aria-label={`Noter ${value} étoile${value > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={22}
                          fill={value <= reviewForm.rating ? 'currentColor' : 'none'}
                          className={value <= reviewForm.rating ? 'text-yellow-accent' : 'text-gray-border'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Commentaire</span>
                  <textarea
                    name="comment"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    placeholder="Décrivez votre expérience sur ce produit"
                    className="mt-2 w-full rounded-lg border border-gray-border bg-gray-bg px-3 py-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                  />
                </label>

                {reviewMessage && (
                  <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">
                    {reviewMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-gray-border disabled:text-gray-text"
                >
                  {reviewSubmitting ? 'Envoi...' : 'Publier mon avis'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-border bg-gray-bg/50 px-4 py-6 text-center">
                <p className="text-sm text-gray-text">
                  Connectez-vous avec un compte client pour laisser un avis.
                </p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductPage
