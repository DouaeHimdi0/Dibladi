import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import useCart from '../hooks/useCart'
import { createOrder, AUTH_STORAGE_KEY } from '../utils/api'

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const initialFormValues = {
  firstName: '',
  lastName: '',
  address: '',
  phone: '',
  city: '',
  postalCode: '',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { items, cartSubtotal, cartCount, cartDeliveryTotal, cartTotal, clearCart } = useCart()

  // Calcul frais de livraison : 40 MAD par vendeur distinct
  const uniqueVendorIds = useMemo(() => {
    return new Set(
      items
        .map(item => item.vendorId || item.sellerId || item.vendor_id || null)
        .filter(id => id !== null && id !== undefined),
    )
  }, [items])

  const fraisLivraison = uniqueVendorIds.size > 0
    ? uniqueVendorIds.size * 40
    : items.length > 0 ? 40 : 0

  const sousTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const total = sousTotal + fraisLivraison

  const cartTotalWithDelivery = total

  const [formValues, setFormValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)

  useEffect(() => {
    if (cartCount === 0 && !isSubmitting && !orderCompleted) {
      navigate('/panier', { replace: true })
    }
  }, [cartCount, isSubmitting, orderCompleted, navigate])

  const orderLines = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: item.price * item.quantity,
      })),
    [items],
  )

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function validateForm() {
    const nextErrors = {}

    Object.entries(formValues).forEach(([key, value]) => {
      if (!String(value).trim()) {
        nextErrors[key] = 'Ce champ est obligatoire.'
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        items: items.map(item => ({
          productId: item.id,
          variantId: item.variantId ?? null,
          quantity: item.quantity
        })),
        deliveryFirstName: formValues.firstName,
        deliveryLastName: formValues.lastName,
        deliveryAddress: formValues.address,
        deliveryCity: formValues.city,
        deliveryPostalCode: formValues.postalCode,
        deliveryPhone: formValues.phone
      }

      const { data } = await createOrder(payload)
      const orderNumber = data.orderNumber
      const fullName = `${formValues.firstName} ${formValues.lastName}`.trim()

      setOrderCompleted(true)
      clearCart()

      navigate('/confirmation-commande', {
        state: {
          orderNumber,
          total: cartTotalWithDelivery,
          customerName: fullName,
          emailSent: false,
        },
        replace: true,
      })
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        global: error.response?.data?.error || 'Une erreur est survenue lors de la création de la commande.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-off-white px-4 py-8 text-black-text sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav className="mb-4 text-sm text-gray-text">
          <span>Panier / Validation de la commande</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <motion.section
            className="rounded-2xl border border-gray-border bg-white p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div>
              <h1 className="text-2xl font-bold text-black-text sm:text-3xl">Validation de la commande</h1>
              <p className="mt-2 text-sm leading-7 text-gray-text">
                Renseignez vos informations de livraison pour finaliser votre commande.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-black-text">Nom</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleChange}
                    className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-main">{errors.lastName}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Prénom</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleChange}
                    className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-main">{errors.firstName}</p>
                  )}
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-black-text">Adresse de livraison complète</span>
                <textarea
                  name="address"
                  value={formValues.address}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-border bg-gray-bg px-3 py-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                />
                {errors.address && <p className="mt-1 text-xs text-red-main">{errors.address}</p>}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-black-text">Numéro de téléphone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-main">{errors.phone}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Ville</span>
                  <input
                    type="text"
                    name="city"
                    value={formValues.city}
                    onChange={handleChange}
                    className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-main">{errors.city}</p>}
                </label>
              </div>

              <label className="block max-w-xs">
                <span className="text-sm font-medium text-black-text">Code postal</span>
                <input
                  type="text"
                  name="postalCode"
                  value={formValues.postalCode}
                  onChange={handleChange}
                  className="mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-red-main">{errors.postalCode}</p>
                )}
              </label>

              {errors.global && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-main">
                  {errors.global}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:opacity-50"
              >
                {isSubmitting ? 'Validation...' : 'Confirmer la commande'}
              </button>
            </form>
          </motion.section>

          <motion.aside
            className="lg:sticky lg:top-24 lg:self-start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border border-gray-border bg-white p-6">
              <h2 className="text-lg font-semibold text-black-text">Récapitulatif de commande</h2>

              <div className="mt-5 space-y-4">
                {orderLines.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-gray-border pb-4 last:border-b-0 last:pb-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-bg">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-text">
                          Produit
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-black-text">{item.name}</p>
                      <p className="mt-1 text-sm text-gray-text">
                        Quantité: {item.quantity} · {formatPrice(item.price)} MAD
                      </p>
                    </div>
                    <p className="text-sm font-medium text-black-text">
                      {formatPrice(item.lineTotal)} MAD
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-border pt-4 text-sm text-gray-text">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{sousTotal} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Frais de livraison
                    <span style={{fontSize:'12px', color:'#666', display:'block'}}>
                      {uniqueVendorIds.size > 0 ? `${uniqueVendorIds.size} vendeur(s) × 40 MAD` : '1 vendeur × 40 MAD'}
                    </span>
                  </span>
                  <span>{fraisLivraison} MAD</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span style={{color:'#B30808'}}>{total} MAD</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  )
}

export default CheckoutPage
