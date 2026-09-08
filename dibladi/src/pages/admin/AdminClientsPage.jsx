import { useEffect, useState } from 'react'
import { fetchAdminClients } from '../../utils/api'

function AdminClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchAdminClients()
      .then(({ data }) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {
        setClients([])
        setError('Impossible de charger les clients.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Clients</h1>

      {loading && <p className="mb-4 text-sm text-gray-text">Chargement...</p>}
      {!loading && error && <p className="mb-4 text-sm text-gray-text">{error}</p>}

      <div className="overflow-x-auto rounded bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-bold uppercase tracking-wider text-black-text">
              <th className="py-2 px-3">ID client</th>
              <th className="py-2 px-3">Nom et prénom</th>
              <th className="py-2 px-3">Adresse de livraison</th>
              <th className="py-2 px-3">Téléphone</th>
              <th className="py-2 px-3">Ville</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-bg/50 transition-colors">
                <td className="py-3 px-3 font-medium">{client.id}</td>
                <td className="py-3 px-3 font-semibold">{client.fullName}</td>
                <td className="py-3 px-3">{client.address || '—'}</td>
                <td className="py-3 px-3">{client.phone || '—'}</td>
                <td className="py-3 px-3">{client.city || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminClientsPage
