import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { getOrderStats } from '../../utils/sellerHelpers'
import { fetchVendorOrders } from '../../utils/api'
import { API_BASE_URL } from '../../config/api'

const FILTER_TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'En cours', label: 'En cours' },
  { id: 'Refusée', label: 'Refusées' },
  { id: 'Livrée', label: 'Livrées' },
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

function getOrderProductTotal(order) {
  return (
    order.items?.reduce(
      (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1),
      0,
    ) || Number(order.prix || 0)
  )
}

function getOrderNetEarnings(order) {
  return getOrderProductTotal(order) * 0.95
}

function getOrderCommission(order) {
  return Number(order.commission ?? getOrderProductTotal(order) * 0.05)
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

function StatCard({ label, value, icon: Icon, className }) {
  return (
    <div className={`rounded-xl border border-gray-border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-text">{label}</p>
          <p className="mt-2 text-3xl font-bold text-black-text">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function OrderMobileCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const rows = [
    { label: 'Numéro de commande', value: order.numeroCommande },
    { label: 'Nom du client', value: order.nomClient },
    { label: 'Prix', value: `${formatPrice(order.prix)} MAD` },
    { label: 'Date', value: formatOrderDate(order.dateCommande) },
  ]

  return (
    <article className="rounded-xl border border-gray-border bg-white overflow-hidden">
      <div className="p-4" onClick={() => setExpanded(!expanded)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black-text flex items-center gap-2">
            {order.numeroCommande}
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </p>
          <StatusBadge statut={order.statut} />
        </div>
        <dl className="space-y-2">
          {rows.slice(1).map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-text">{row.label}</dt>
              <dd className="text-sm text-black-text sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      
      {expanded && (
        <div className="bg-gray-bg/30 p-4 border-t border-gray-border">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black-text mb-3">Détails des articles</h4>
          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-border">
                  <div className="w-12 h-12 rounded bg-gray-bg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.productImage ? (
                      <img 
                        src={item.productImage.startsWith('http') || item.productImage.startsWith('data:') 
                          ? item.productImage 
                          : `${API_BASE_URL}${item.productImage.startsWith('/') ? '' : '/'}${item.productImage}`}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black-text line-clamp-1">{item.productName}</p>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-xs text-gray-text">Qté: {item.quantity}</span>
                      <span className="text-sm font-bold text-black-text">{formatPrice(item.unitPrice)} MAD</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-text italic">Aucun détail disponible</p>
            )}
          </div>
          
          {(() => {
            const productTotal = getOrderProductTotal(order)
            const netEarnings = getOrderNetEarnings(order)
            return (
              <div className="mt-4 pt-3 border-t border-gray-border/60 flex flex-wrap justify-between items-center text-sm gap-2 bg-white p-3 rounded-lg border">
                <div>
                  <span className="text-gray-text font-medium">Montant produit (hors livraison) : </span>
                  <span className="font-bold text-black-text">{formatPrice(productTotal)} MAD</span>
                </div>
                <div className="text-red-main">
                  <span className="font-medium">Commission plateforme (5%) : </span>
                  <span className="font-bold">{formatPrice(getOrderCommission(order))} MAD</span>
                </div>
                <div className="rounded-lg bg-green-50 px-3 py-1.5 border border-green-200">
                  <span className="text-green-800 text-xs font-bold uppercase tracking-wider">Montant qui vous revient : </span>
                  <span className="font-bold text-green-700 text-base">{formatPrice(netEarnings)} MAD</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </article>
  )
}

function OrderTableRow({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr 
        className="border-t border-gray-border transition-colors duration-200 hover:bg-gray-bg/60 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-semibold text-black-text flex items-center gap-2">
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          {order.numeroCommande}
        </td>
        <td className="px-4 py-3 font-semibold text-black-text">{order.nomClient}</td>
        <td className="px-4 py-3 font-bold text-black-text">
          {formatPrice(order.prix)} MAD
        </td>
        <td className="px-4 py-3">
          <StatusBadge statut={order.statut} />
        </td>
        <td className="px-4 py-3 text-gray-text font-medium">
          {formatOrderDate(order.dateCommande)}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-bg/30">
          <td colSpan={5} className="px-4 py-4 border-t border-gray-border/50">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black-text mb-3">Détails des articles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-border">
                    <div className="w-12 h-12 rounded bg-gray-bg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.productImage ? (
                        <img 
                          src={item.productImage.startsWith('http') || item.productImage.startsWith('data:') 
                            ? item.productImage 
                            : `${API_BASE_URL}${item.productImage.startsWith('/') ? '' : '/'}${item.productImage}`}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-sm font-semibold text-black-text line-clamp-1" title={item.productName}>{item.productName}</p>
                      <div className="flex justify-between items-end mt-1 text-sm">
                        <span className="text-gray-text">Qté: {item.quantity}</span>
                        <span className="font-bold text-black-text">{formatPrice(item.unitPrice)} MAD</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-text italic">Aucun détail disponible</p>
              )}
            </div>

            {(() => {
              const productTotal = getOrderProductTotal(order)
              const netEarnings = getOrderNetEarnings(order)
              return (
                <div className="mt-4 pt-3 border-t border-gray-border/60 flex flex-wrap justify-between items-center text-sm gap-2 bg-white p-3 rounded-lg border">
                  <div>
                    <span className="text-gray-text font-semibold">Montant produit (hors livraison) : </span>
                    <span className="font-bold text-black-text">{formatPrice(productTotal)} MAD</span>
                  </div>
                  <div className="text-red-main">
                    <span className="font-semibold">Commission plateforme (5%) : </span>
                    <span className="font-bold">{formatPrice(getOrderCommission(order))} MAD</span>
                  </div>
                  <div className="rounded-lg bg-green-50 px-3 py-1.5 border border-green-200">
                  <span className="text-green-800 text-xs font-bold uppercase tracking-wider">Montant qui vous revient : </span>
                    <span className="font-bold text-green-700 text-base">{formatPrice(netEarnings)} MAD</span>
                  </div>
                </div>
              );
            })()}
          </td>
        </tr>
      )}
    </>
  )

}

function SellerOrdersSection() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sellerOrders, setSellerOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchVendorOrders()
      .then(({ data }) => {
        const mappedOrders = (Array.isArray(data) ? data : []).map(order => ({
          id: order.id,
          numeroCommande: order.orderNumber,
          nomClient: `${order.deliveryFirstName || ''} ${order.deliveryLastName || ''}`.trim() || 'Client',
          prix: order.totalAmount,
          commission: order.commission,
          statut: order.deliveryStatus === 'IN_PROGRESS' ? 'En cours' : order.deliveryStatus === 'RECENT' ? 'En cours de livraison' : order.deliveryStatus === 'REFUSED' ? 'Refusée' : 'Livrée',
          dateCommande: order.createdAt,
          items: order.items || [], // Include items from the API response
        }))
        // Sort orders by date descending
        mappedOrders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande))
        setSellerOrders(mappedOrders)
      })
      .catch(() => setSellerOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => getOrderStats(sellerOrders), [sellerOrders])

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return sellerOrders
    }

    return sellerOrders.filter((order) => order.statut === activeFilter)
  }, [activeFilter, sellerOrders])

  const totalNetEarnings = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + getOrderNetEarnings(order), 0),
    [filteredOrders],
  )

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-text">Chargement des commandes...</div>
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="En cours"
          value={stats.enCours}
          icon={Clock}
          className="bg-red-light text-red-main"
        />
        <StatCard
          label="Refusées"
          value={stats.refusees}
          icon={XCircle}
          className="bg-gray-bg text-gray-text"
        />
        <StatCard
          label="Livrées"
          value={stats.livrees}
          icon={CheckCircle}
          className="bg-white text-red-main"
        />
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-2">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-5"
        >
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-border bg-white px-6 py-14 text-center">
              <p className="text-sm text-gray-text">Aucune commande pour ce filtre.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-green-800">
                    Total des gains nets vendeur
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} · commission plateforme 5% déduite
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-700 sm:text-3xl">
                  {formatPrice(totalNetEarnings)} MAD
                </p>
              </div>

              <div className="hidden overflow-hidden rounded-xl border border-gray-border bg-white md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-bg text-xs uppercase tracking-wide text-gray-text">
                    <tr>
                      <th className="px-4 py-3 font-medium">Numéro de commande</th>
                      <th className="px-4 py-3 font-medium">Nom du client</th>
                      <th className="px-4 py-3 font-medium">Prix</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium">Date de la commande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <OrderTableRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 md:hidden">
                {filteredOrders.map((order) => (
                  <OrderMobileCard key={order.id} order={order} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SellerOrdersSection
