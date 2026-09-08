import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchAdminVendors, updateAdminVendorScore } from '../../utils/api'

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {approved ? 'Approuvé' : 'En attente'}
    </span>
  )
}

function AdminVendorsPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const searchParam = params.get('search') || ''
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingScores, setEditingScores] = useState({})

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAdminVendors()
      .then(({ data }) => setVendors(Array.isArray(data) ? data : []))
      .catch(() => {
        setVendors([])
        setError('Impossible de charger les vendeurs.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!searchParam) return vendors
    return vendors.filter((v) => String(v.id).toLowerCase() === searchParam.toLowerCase())
  }, [vendors, searchParam])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vendeurs</h1>

      {loading && <p className="text-sm text-gray-text mb-4">Chargement...</p>}
      {!loading && error && <p className="text-sm text-gray-text mb-4">{error}</p>}

      {searchParam && filtered.length === 1 && (
        <div className="mb-4 bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Fiche vendeur: {filtered[0].fullName}</h3>
          <div className="text-sm text-gray-600">ID: {filtered[0].id} • Boutique: {filtered[0].shopName}</div>
        </div>
      )}

      <div className="bg-white rounded shadow-sm p-4 mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-black-text border-b pb-2">
              <th className="py-2 px-3">ID Vendeur</th>
              <th className="py-2 px-3">Nom</th>
              <th className="py-2 px-3">Boutique</th>
              <th className="py-2 px-3">Coordonnées bancaires</th>
              <th className="py-2 px-3">Statut</th>
              <th className="py-2 px-3 text-center">Produits actifs</th>
              <th className="py-2 px-3 text-center">Commandes totales</th>
              <th className="py-2 px-3 text-center">Commandes 48h</th>
              <th className="py-2 px-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-bg/50 transition-colors align-top">
                <td className="py-3 px-3 font-medium">{v.id}</td>
                <td className="py-3 px-3 font-semibold">{v.fullName}</td>
                <td className="py-3 px-3">{v.shopName}</td>
                <td className="py-3 px-3 text-xs text-gray-600">
                  {(v.bankAccountHolderName || v.bankName || v.bankRib) ? (
                    <div className="space-y-1">
                      {v.bankAccountHolderName && <div><span className="font-medium text-black">Titulaire:</span> {v.bankAccountHolderName}</div>}
                      {v.bankName && <div><span className="font-medium text-black">Banque:</span> {v.bankName}</div>}
                      {v.bankRib && <div><span className="font-medium text-black">RIB:</span> {v.bankRib}</div>}
                    </div>
                  ) : (
                    <span className="italic text-gray-400">Non renseigné</span>
                  )}
                </td>
                <td className="py-3 px-3"><ApprovalBadge approved={Boolean(v.approved)} /></td>
                <td className="py-3 px-3 text-center font-bold">{v.activeProductsCount ?? 0}</td>
                <td className="py-3 px-3 text-center font-bold">{v.totalOrdersCount ?? 0}</td>
                <td className="py-3 px-3 text-center font-bold text-red-main">{v.last48hOrdersCount ?? 0}</td>
                <td className="py-3 px-3 text-right font-bold">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingScores[v.id] ?? (v.score ?? 0)}
                      onChange={(e) => setEditingScores((s) => ({ ...s, [v.id]: Number(e.target.value) }))}
                      className="w-20 rounded border px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newScore = editingScores[v.id] ?? (v.score ?? 0)
                        updateAdminVendorScore(v.id, newScore)
                          .then(() => {
                            setVendors((prev) => prev.map(it => it.id === v.id ? { ...it, score: newScore } : it))
                          })
                          .catch(() => alert('Impossible de mettre à jour le score'))
                      }}
                      className="rounded bg-red-main px-3 py-1 text-sm text-white"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default AdminVendorsPage
