import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useCart from '../hooks/useCart'

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatVariantLabel(combinationLabel) {
  try {
    const attributes = JSON.parse(combinationLabel)
    return attributes.type === 'simple' ? null : Object.values(attributes).join(' • ')
  } catch {
    return null
  }
}

function CartPage() {
  const navigate = useNavigate()
  const { items, cartSubtotal, cartTotal, cartDeliveryTotal, updateQuantity, removeFromCart } = useCart()

  // Calcul frais de livraison : 40 MAD par vendeur distinct
  const uniqueVendorIds = useMemo(() => {
    return new Set(
      items
        .map(item => item.vendorId || item.sellerId || item.vendor_id || null)
        .filter(id => id !== null && id !== undefined),
    )
  }, [items])

  // Si vendorId présent : 40 par vendeur distinct
  // Sinon fallback : 40 MAD fixe (1 vendeur supposé)
  const fraisLivraison = uniqueVendorIds.size > 0
    ? uniqueVendorIds.size * 40
    : items.length > 0 ? 40 : 0

  const sousTotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )

  const total = sousTotal + fraisLivraison

  if (items.length === 0) {
    return (
      <main className="bg-off-white px-4 py-12 text-black-text sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-gray-border bg-white px-6 py-12 text-center">
          <ShoppingCart size={36} className="text-red-main" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-black-text sm:text-3xl">Votre panier est vide</h1>
          <p className="mt-2 max-w-md text-sm leading-7 text-gray-text">
            Parcourez nos categories pour ajouter des produits marocains authentiques a votre panier.
          </p>
          <Link
            to="/categorie/tout"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
          >
            Continuer les achats
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-off-white px-4 py-8 text-black-text sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <h1 className="text-2xl font-bold text-black-text sm:text-3xl">Votre panier</h1>

          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.article
                  key={`${item.id}-${item.variantId ?? 'simple'}`}
                  layout
                  initial={{ opacity: 0, height: 0, y: 12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden rounded-2xl border border-gray-border bg-white"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-bg">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-text">
                          Produit
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[15px] font-semibold text-black-text">{item.name}</h2>
                      {formatVariantLabel(item.variantLabel) && <p className="mt-1 text-xs text-gray-text">{formatVariantLabel(item.variantLabel)}</p>}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-red-main">{formatPrice(item.price)} MAD</p>
                        <span className="rounded-full bg-green-accent/10 px-2 py-0.5 text-[11px] font-medium text-green-accent">
                          En stock
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-border bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                            className="flex h-11 w-11 items-center justify-center text-lg text-gray-text transition-colors duration-200 hover:text-red-main"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(item.id, Number(event.target.value) || 1, item.variantId)
                            }
                            className="h-11 w-16 border-x border-gray-border text-center text-sm text-black-text outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                            className="flex h-11 w-11 items-center justify-center text-lg text-gray-text transition-colors duration-200 hover:text-red-main"
                          >
                            +
                          </button>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="text-gray-text">+ 40 MAD livraison par vendeur</p>
                          <p className="text-gray-text">
                            Total ligne: {formatPrice(item.price * item.quantity)} MAD
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id, item.variantId)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-border text-gray-text transition-colors duration-200 hover:border-red-main hover:text-red-main"
                      aria-label="Supprimer l'article"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-border bg-white p-6">
            <h2 className="text-lg font-semibold text-black-text">Recapitulatif</h2>
            <div className="mt-5 space-y-3 text-sm text-gray-text">
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

            <button
              type="button"
              onClick={() => navigate('/commande')}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
            >
              Valider le panier
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default CartPage
