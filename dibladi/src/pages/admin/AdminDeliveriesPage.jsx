import { useEffect, useState } from 'react'
import { fetchAdminDeliveries, updateAdminDeliveryStatus } from '../../utils/api'

function StatusPill({ statut }) {
  const map = {
    'En cours': 'bg-[#FD3E3E] text-white',
    'En cours de livraison': 'bg-[#F39C12] text-white',
    'Livrée': 'bg-[#22C55E] text-white',
    'Refusée': 'bg-gray-300 text-black',
  }
  return <span className={`px-2 py-1 rounded text-sm ${map[statut] || 'bg-gray-200'}`}>{statut}</span>
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded border border-gray-border px-2 py-1 text-sm"
    >
      <option value="IN_PROGRESS">En cours</option>
      <option value="RECENT">En cours de livraison</option>
      <option value="REFUSED">Refusée</option>
      <option value="DELIVERED">Livrée</option>
    </select>
  )
}

function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadDeliveries() {
    setLoading(true)
    setError(null)

    try {
      const { data } = await fetchAdminDeliveries()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch {
      setDeliveries([])
      setError('Impossible de charger les livraisons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  async function handleStatusChange(id, status) {
    try {
      await updateAdminDeliveryStatus(id, status)
      setDeliveries((current) => current.map((delivery) => delivery.id === id ? { ...delivery, status } : delivery))
    } catch {
      alert('Impossible de mettre à jour le statut de la livraison.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Livraisons</h1>

      {loading && <p className="text-sm text-gray-text mb-4">Chargement...</p>}
      {!loading && error && <p className="text-sm text-gray-text mb-4">{error}</p>}

      <div className="bg-white rounded shadow-sm p-4">
        {deliveries.length === 0 ? (
          <p className="text-sm text-gray-text">
            Aucune livraison n’est encore créée dans la base de données.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>N° Livraison</th>
                <th>Adresse Vendeur</th>
                <th>Adresse Client</th>
                <th>Prix Commande</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-2">{d.deliveryNumber || d.id}</td>
                  <td className="py-2">{d.vendorAddress || '—'}, {d.vendorCity || '—'}</td>
                  <td className="py-2">{d.clientAddress || '—'}, {d.clientCity || '—'}</td>
                  <td className="py-2">{Number(d.orderAmount || 0)} MAD</td>
                  <td className="py-2">
                    <StatusPill statut={d.status === 'DELIVERED' ? 'Livrée' : d.status === 'IN_PROGRESS' ? 'En cours' : d.status === 'RECENT' ? 'En cours de livraison' : d.status === 'REFUSED' ? 'Refusée' : '—'} />
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col gap-2">
                      <StatusSelect value={d.status || 'IN_PROGRESS'} onChange={(nextStatus) => handleStatusChange(d.id, nextStatus)} />
                      <span className="text-xs text-gray-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminDeliveriesPage
