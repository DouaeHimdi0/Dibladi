import { useEffect, useMemo, useState } from 'react'
import { Users, UserCheck, ShoppingBag, TrendingUp, Package, Boxes, CircleDollarSign } from 'lucide-react'
import { fetchAdminDashboard } from '../../utils/api'

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#FD3E3E]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-[#FFF0F0] text-[#FD3E3E]"><Icon size={20} /></div>
        <div>
          <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
          <div className="text-sm text-gray-text">{label}</div>
        </div>
      </div>
    </div>
  )
}

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAdminDashboard()
      .then(({ data }) => setDashboard(data))
      .catch(() => {
        setDashboard(null)
        setError('Impossible de charger le tableau de bord.')
      })
      .finally(() => setLoading(false))
  }, [])

  const orders = Array.isArray(dashboard?.orders) ? dashboard.orders : []

  const chartData = useMemo(() => {
    const metrics = [
      { label: 'Vendeurs', value: Number(dashboard?.activeVendors ?? 0), color: '#FD3E3E' },
      { label: 'Clients', value: Number(dashboard?.clientsCount ?? 0), color: '#F97316' },
      { label: 'Produits', value: Number(dashboard?.activeProductsCount ?? 0), color: '#EAB308' },
      { label: 'Commandes', value: Number(dashboard?.ordersCount ?? 0), color: '#14B8A6' },
      { label: 'Livraisons', value: Number(dashboard?.deliveriesCount ?? 0), color: '#3B82F6' },
      { label: 'Demandes', value: Number(dashboard?.pendingRequests ?? 0), color: '#8B5CF6' },
    ]

    const maxValue = Math.max(...metrics.map((item) => item.value), 1)

    return metrics.map((item) => ({
      ...item,
      height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 14 : 0)}%`,
    }))
  }, [dashboard])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {loading && <p className="text-sm text-gray-text mb-4">Chargement...</p>}
      {!loading && error && <p className="text-sm text-gray-text mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={Users} value={dashboard?.activeVendors ?? '—'} label="Vendeurs actifs" />
        <StatCard icon={UserCheck} value={dashboard?.clientsCount ?? '—'} label="Clients inscrits" />
        <StatCard icon={Package} value={dashboard?.activeProductsCount ?? '—'} label="Produits actifs" />
        <StatCard icon={ShoppingBag} value={dashboard?.ordersCount ?? '—'} label="Commandes total" />
        <StatCard icon={Boxes} value={dashboard?.deliveriesCount ?? '—'} label="Livraisons" />
        <StatCard icon={TrendingUp} value={`${dashboard?.pendingRequests ?? 0} en attente`} label="Demandes vendeurs" />
        <StatCard icon={CircleDollarSign} value={`${Number(dashboard?.turnoverTotal ?? 0).toFixed(2)} MAD`} label="Chiffre d'affaires" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-semibold mb-4">Indicateurs marketplace</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {chartData.map((item) => (
            <div key={item.label} className="flex min-h-[240px] flex-col justify-end gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex h-40 items-end justify-center rounded bg-white p-2">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: item.height,
                    background: item.color,
                    opacity: 0.85,
                  }}
                  aria-hidden="true"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#1A1A1A]">{item.value}</div>
                <div className="text-xs text-gray-text">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-3">Dernières commandes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="pb-2">N° Commande</th>
              <th className="pb-2">Vendeur</th>
              <th className="pb-2">Prix</th>
              <th className="pb-2">Commission (5%)</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-t">
                <td className="py-2">{o.orderNumber || o.id}</td>
                <td className="py-2">{o.client?.firstName || '—'}</td>
                <td className="py-2">{Number(o.totalAmount || 0)} MAD</td>
                <td className="py-2 text-green-600">{Number(o.commission || 0)} MAD</td>
                <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboardPage
