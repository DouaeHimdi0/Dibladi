import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'
import {
  approveVendorRequest,
  fetchAdminRequests,
  rejectVendorRequest,
} from '../../utils/api'

const STATUS_LABELS = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) {
    return null
  }

  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl
  }

  return `${API_BASE_URL}${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`
}

function CredentialsModal({ credentials, onClose }) {
  if (!credentials) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Compte vendeur créé</h2>
        <p className="mt-2 text-sm text-gray-text">
          Le vendeur peut maintenant se connecter avec les informations fournies lors de sa demande.
        </p>

        <div className="mt-4 space-y-3 rounded border border-[#E0E0E0] bg-[#FAFAFA] p-4 text-sm">
          <div>
            <span className="font-medium text-gray-text">Email :</span>
            <p className="mt-1 font-mono text-[#1A1A1A]">{credentials.email}</p>
          </div>
        </div>

        {credentials.message && (
          <p className="mt-3 text-xs text-gray-text">{credentials.message}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded bg-[#B30808] py-2 text-sm font-medium text-white hover:bg-[#B30808]"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

function RequestDetails({ request }) {
  const photoSrc = resolvePhotoUrl(request.photoUrl)

  return (
    <div className="mt-3 grid gap-2 text-sm text-gray-text sm:grid-cols-2">
      <p><span className="font-medium">Prénom :</span> {request.firstName}</p>
      <p><span className="font-medium">Nom :</span> {request.lastName}</p>
      <p><span className="font-medium">Email :</span> {request.email}</p>
      <p><span className="font-medium">Téléphone :</span> {request.phone}</p>
      <p><span className="font-medium">Boutique :</span> {request.shopName}</p>
      <p><span className="font-medium">Ville :</span> {request.city}</p>
      <p className="sm:col-span-2">
        <span className="font-medium">Adresse :</span> {request.shopAddress}
      </p>
      <p>
        <span className="font-medium">Instagram :</span>{' '}
        {request.instagramLink ? (
          <a
            href={request.instagramLink}
            target="_blank"
            rel="noreferrer"
            className="text-[#B30808] hover:underline"
          >
            {request.instagramLink}
          </a>
        ) : (
          '—'
        )}
      </p>
      <p>
        <span className="font-medium">Autre lien :</span>{' '}
        {request.socialLink ? (
          <a
            href={request.socialLink}
            target="_blank"
            rel="noreferrer"
            className="text-[#B30808] hover:underline"
          >
            {request.socialLink}
          </a>
        ) : (
          '—'
        )}
      </p>
      <p><span className="font-medium">Date :</span> {formatDate(request.createdAt)}</p>
      <p>
        <span className="font-medium">Statut :</span>{' '}
        {STATUS_LABELS[request.status] || request.status}
      </p>
      {photoSrc && (
        <div className="sm:col-span-2">
          <span className="font-medium">Photo :</span>
          <img
            src={photoSrc}
            alt={`Photo de ${request.shopName}`}
            className="mt-2 h-32 w-32 rounded border border-[#E0E0E0] object-cover"
          />
        </div>
      )}
    </div>
  )
}

function AdminRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const PAGE_SIZE = 15

  const loadRequests = useCallback(async (page = 0) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await fetchAdminRequests({ page, size: PAGE_SIZE })
      const content = Array.isArray(data?.content) ? data.content : []
      setRequests(content)
      setCurrentPage(page)
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1)
      setTotalRequests(typeof data?.totalElements === 'number' ? data.totalElements : content.length)
    } catch {
      setRequests([])
      setTotalPages(1)
      setTotalRequests(0)
      setError('Impossible de charger les demandes vendeurs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests(0)
  }, [loadRequests])

  async function handleApprove(request) {
    setActionLoadingId(request.id)
    setActionError(null)

    try {
      const { data } = await approveVendorRequest(request.id)

      setCredentials({
        email: data.email || request.email,
        message:
          data.message ||
          'La demande a été approuvée. Le vendeur peut se connecter avec son email et le mot de passe choisi.',
      })

      await loadRequests(currentPage)
    } catch (err) {
      setActionError(
        err.response?.data?.error || 'Impossible d’approuver cette demande.',
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleReject(id) {
    setActionLoadingId(id)
    setActionError(null)

    try {
      await rejectVendorRequest(id)
      await loadRequests(currentPage)
    } catch (err) {
      setActionError(
        err.response?.data?.error || 'Impossible de rejeter cette demande.',
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  const pendingRequests = requests.filter((request) => request.status === 'PENDING')
  const processedRequests = requests.filter((request) => request.status !== 'PENDING')

  return (
    <div>
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />

      <h1 className="mb-4 text-2xl font-bold">Demandes vendeurs</h1>

      {loading && <p className="mb-4 text-sm text-gray-text">Chargement...</p>}
      {!loading && error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <div className="mb-6 rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">En attente ({pendingRequests.length})</h2>

        {pendingRequests.length === 0 && !loading ? (
          <p className="text-sm text-gray-text">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded border border-[#E0E0E0] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">
                      {request.firstName} {request.lastName}
                    </p>
                    <p className="text-sm text-[#555555]">{request.shopName} — {request.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === request.id}
                      onClick={() => handleApprove(request)}
                      className="rounded bg-[#B30808] px-3 py-1 text-sm text-white hover:bg-[#B30808] disabled:opacity-60"
                    >
                      {actionLoadingId === request.id ? 'Traitement...' : 'Approuver'}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === request.id}
                      onClick={() => handleReject(request.id)}
                      className="rounded border px-3 py-1 text-sm hover:bg-[#FAFAFA] disabled:opacity-60"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>

                <RequestDetails request={request} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Historique ({processedRequests.length})</h2>

        {processedRequests.length === 0 && !loading ? (
          <p className="text-sm text-gray-text">Aucune demande traitée pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <div key={request.id} className="rounded border border-[#E0E0E0] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">
                      {request.firstName} {request.lastName}
                    </p>
                    <p className="text-sm text-[#555555]">{request.shopName} — {request.city}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      request.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {STATUS_LABELS[request.status] || request.status}
                  </span>
                </div>

                <RequestDetails request={request} />
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading || currentPage === 0}
            onClick={() => loadRequests(Math.max(0, currentPage - 1))}
            className="inline-flex items-center rounded border border-gray-border bg-white px-4 py-2 text-sm font-medium text-black-text transition-colors duration-200 hover:border-red-main hover:text-red-main disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-text">
            Page {currentPage + 1} sur {totalPages} — {totalRequests} demandes
          </span>
          <button
            type="button"
            disabled={loading || currentPage >= totalPages - 1}
            onClick={() => loadRequests(Math.min(totalPages - 1, currentPage + 1))}
            className="inline-flex items-center rounded border border-gray-border bg-white px-4 py-2 text-sm font-medium text-black-text transition-colors duration-200 hover:border-red-main hover:text-red-main disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminRequestsPage
