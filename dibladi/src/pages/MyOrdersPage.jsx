import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Package, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../utils/api'
import { API_BASE_URL } from '../config/api'

const FILTER_TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'En cours', label: 'En cours' },
  { id: 'Livrée', label: 'Livrées' },
  { id: 'Refusée', label: 'Refusées' },
]

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatOrderDate(isoDate) {
  try {
    if (!isoDate) return 'Date inconnue'
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return 'Date invalide'
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch (e) {
    return 'Date invalide'
  }
}

function StatusBadge({ statut }) {
  if (statut === 'En cours') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-main/20 bg-red-light px-2.5 py-1 text-xs font-medium text-red-main">
        <Clock size={13} aria-hidden="true" />
        En cours
      </span>
    )
  }

  if (statut === 'Refusée') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-border bg-gray-bg px-2.5 py-1 text-xs font-medium text-gray-text">
        <XCircle size={13} aria-hidden="true" />
        Refusée
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-main bg-white px-2.5 py-1 text-xs font-medium text-red-main">
      <CheckCircle size={13} aria-hidden="true" />
      Livrée
    </span>
  )
}

function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-2xl border border-gray-border bg-white overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-border/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-black-text">{order.numeroCommande}</h2>
            <StatusBadge statut={order.statut} />
          </div>
          <p className="mt-1 text-sm text-gray-text">
            Commandé le {formatOrderDate(order.dateCommande)}
          </p>
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-1">
          <p className="text-xl font-bold text-red-main">{formatPrice(order.prix)} MAD</p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-gray-text hover:text-black-text flex items-center gap-1 transition-colors"
          >
            {isExpanded ? 'Masquer détails' : 'Voir détails'}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 bg-gray-bg/30">
          <h3 className="text-sm font-semibold text-black-text mb-4 uppercase tracking-wider">
            Articles de la commande
          </h3>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-border bg-white">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-bg overflow-hidden border border-gray-border/50">
                  {item.productImage ? (
                    <img 
                      src={item.productImage.startsWith('http') || item.productImage.startsWith('data:') 
                        ? item.productImage 
                        : `${API_BASE_URL}${item.productImage.startsWith('/') ? '' : '/'}${item.productImage}`}
                      alt={item.productName} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-text">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-black-text">{item.productName}</h4>
                  <p className="text-xs text-gray-text mt-0.5">Vendu par : {item.vendorShopName || 'Boutique'}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-text">Qté : {item.quantity}</p>
                    <p className="text-sm font-bold text-black-text">{formatPrice(item.unitPrice)} MAD</p>
                  </div>
                </div>
              </div>
            ))}
            
            {(!order.items || order.items.length === 0) && (
              <p className="text-sm text-gray-text italic">Aucun détail d'article disponible pour cette commande.</p>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-border">
            <h3 className="text-sm font-semibold text-black-text mb-2 uppercase tracking-wider">
              Adresse de livraison
            </h3>
            <p className="text-sm text-gray-text">
              {order.deliveryFirstName} {order.deliveryLastName}<br/>
              {order.deliveryAddress}<br/>
              {order.deliveryPostalCode} {order.deliveryCity}<br/>
              Tél: {order.deliveryPhone}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function MyOrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    fetchMyOrders()
      .then(({ data }) => {
        const mappedOrders = (Array.isArray(data) ? data : []).map(order => ({
          id: order.id,
          numeroCommande: order.orderNumber,
          prix: order.totalAmount,
          statut: order.deliveryStatus === 'IN_PROGRESS' ? 'En cours' : order.deliveryStatus === 'RECENT' ? 'En cours de livraison' : order.deliveryStatus === 'REFUSED' ? 'Refusée' : 'Livrée',
          dateCommande: order.createdAt,
          items: order.items || [],
          deliveryFirstName: order.deliveryFirstName,
          deliveryLastName: order.deliveryLastName,
          deliveryAddress: order.deliveryAddress,
          deliveryCity: order.deliveryCity,
          deliveryPostalCode: order.deliveryPostalCode,
          deliveryPhone: order.deliveryPhone,
        }))
        // Trier par date (plus récent d'abord)
        mappedOrders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande))
        setOrders(mappedOrders)
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des commandes :", err)
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = useMemo(() => {
    let result = orders

    const params = new URLSearchParams(location.search)
    const q = params.get('q')

    if (q && q.trim().length > 0) {
      const tq = q.trim()
      // Filter by order number substring (case-insensitive)
      result = result.filter(order => String(order.numeroCommande || '').toLowerCase().includes(tq.toLowerCase()))
    }

    if (activeFilter === 'all') return result
    return result.filter(order => order.statut === activeFilter)
  }, [activeFilter, orders])

  return (
    <main className="min-h-screen bg-off-white text-black-text px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-black-text sm:text-3xl mb-6">Mes commandes</h1>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-text">Chargement de vos commandes...</div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-red-main text-white'
                        : 'border border-gray-border bg-white text-gray-text hover:text-black-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-border bg-white px-6 py-16 text-center">
                <Package size={48} className="mx-auto text-gray-border mb-4" />
                <h3 className="text-lg font-bold text-black-text">Aucune commande</h3>
                <p className="mt-2 text-sm text-gray-text max-w-md mx-auto">
                  {activeFilter === 'all' 
                    ? "Vous n'avez pas encore de commandes. Commencez vos achats !" 
                    : "Aucune commande ne correspond à ce statut."}
                </p>
                {activeFilter === 'all' && (
                  <Link 
                    to="/categorie/tout" 
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-red-main px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
                  >
                    Découvrir nos produits
                  </Link>
                )}

              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default MyOrdersPage
