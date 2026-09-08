import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchAdminOrders } from '../../utils/api'

function StatusBadge({ status }) {
  if (status === 'En cours') return <span className="px-2 py-1 rounded text-sm bg-[#FFF0F0] text-[#FD3E3E] flex items-center gap-2"><Clock size={14}/> En cours</span>
  if (status === 'Livrée') return <span className="px-2 py-1 rounded text-sm bg-[#F0FFF4] text-[#22C55E] flex items-center gap-2"><CheckCircle size={14}/> Livrée</span>
  return <span className="px-2 py-1 rounded text-sm bg-[#F5F5F5] text-gray-text flex items-center gap-2"><XCircle size={14}/> Refusée</span>
}

function AdminOrdersPage() {
  const [tab, setTab] = useState('Toutes')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAdminOrders()
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {
        setOrders([])
        setError('Impossible de charger les commandes.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    if (tab === 'Toutes') return true
    if (tab === 'En cours') return o.status === 'PENDING'
    if (tab === 'Livrées') return o.status === 'DELIVERED'
    if (tab === 'Refusées') return o.status === 'CANCELLED'
    return true
  })

  const totalCommission = orders.reduce((s, o) => s + Number(o.commission || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Commandes</h1>

      {loading && <p className="text-sm text-gray-text mb-4">Chargement...</p>}
      {!loading && error && <p className="text-sm text-gray-text mb-4">{error}</p>}

      <div className="flex gap-2 mb-4">
        {['Toutes','En cours','Livrées','Refusées'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab===t? 'bg-white text-[#FD3E3E]': 'bg-transparent'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-text">Aucune commande n’est encore enregistrée dans la base.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>N° Commande</th>
                <th>ID Client</th>
                <th>Nom Client</th>
                <th>Prix</th>
                <th>Articles / vendeurs</th>
                <th>Commission 5%</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const clientId = o.clientId ?? o.client?.id ?? '—'
                const clientName = o.clientFirstName || o.client?.firstName
                  ? `${o.clientFirstName || o.client?.firstName || ''} ${o.clientLastName || o.client?.lastName || ''}`.trim()
                  : '—'

                return (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">{o.orderNumber || o.id}</td>
                    <td className="py-2">{clientId}</td>
                    <td className="py-2">{clientName}</td>
                    <td className="py-2">{Number(o.totalAmount || 0)} MAD</td>
                    <td className="py-2">
                      <div className="space-y-1">
                        {(o.items || []).map((item) => (
                          <div key={`${o.id}-${item.productId}`} className="text-xs">
                            <span className="font-semibold">Produit : {item.productName || `Produit #${item.productId}`}</span>
                            <span className="text-gray-text"> — ID : {item.vendorId ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 text-green-600">{Number(o.commission || 0)} MAD</td>
                    <td className="py-2"><StatusBadge status={o.status === 'PENDING' ? 'En cours' : o.status === 'DELIVERED' ? 'Livrée' : o.status === 'CANCELLED' ? 'Refusée' : 'En cours'} /></td>
                    <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className="mt-4 font-bold text-[#FD3E3E]">Commission totale DiblaDi : {totalCommission.toFixed(2)} MAD</div>
      </div>
    </div>
  )
}

export default AdminOrdersPage
