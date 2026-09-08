import { useEffect, useState } from 'react'
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  uploadCategoryImage,
  fetchAdminParentCategories,
  updateAdminParentCategory,
} from '../../utils/api'

const initialFormState = {
  name: '',
  imageUrl: '',
  isActive: true,
  parentCategoryId: '',
  file: null,
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [parentFiles, setParentFiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(initialFormState)
  const [previewUrl, setPreviewUrl] = useState('')
  const [editCategory, setEditCategory] = useState(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    setError(null)

    try {
      const [{ data }, { data: parentData }] = await Promise.all([
        fetchAdminCategories(),
        fetchAdminParentCategories(),
      ])
      setCategories(Array.isArray(data) ? data : [])
      setParentCategories(Array.isArray(parentData) ? parentData : [])

    } catch (err) {
      setCategories([])
      setError('Impossible de charger les catégories.')
    } finally {
      setLoading(false)
    }
  }

  function handleParentFileChange(parentId, event) {
    const file = event.target.files?.[0]
    if (file) {
      setParentFiles((current) => ({ ...current, [parentId]: file }))
    }
  }

  async function handleParentSave(parent) {
    try {
      let imageUrl = parent.imageUrl || null
      const file = parentFiles[parent.id]
      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        const { data } = await uploadCategoryImage(uploadData)
        imageUrl = data?.url || imageUrl
      }

      const { data } = await updateAdminParentCategory(parent.id, {
        name: parent.name,
        imageUrl,
        isActive: parent.isActive,
      })
      setParentCategories((current) => current.map((item) => (item.id === data.id ? data : item)))
      setParentFiles((current) => {
        const next = { ...current }
        delete next[parent.id]
        return next
      })
      setFeedback({ type: 'success', text: 'Grande catégorie mise à jour.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Impossible de mettre à jour la grande catégorie.' })
    }
  }

  function resetForm() {
    setEditCategory(null)
    setForm(initialFormState)
    setPreviewUrl('')
    setFeedback(null)
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setForm((prev) => ({ ...prev, file }))
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  function handleEdit(category) {
    setEditCategory(category)
    setForm({
      name: category.name || '',
      imageUrl: category.imageUrl || '',
      isActive: Boolean(category.isActive),
      parentCategoryId: category.parentCategoryId || '',
      file: null,
    })
    setPreviewUrl(category.imageUrl || '')
    setFeedback(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      let imageUrl = editCategory?.imageUrl ?? null
      if (form.file) {
        const uploadData = new FormData()
        uploadData.append('file', form.file)
        const { data } = await uploadCategoryImage(uploadData)
        imageUrl = data?.url || imageUrl
      }

      const payload = {
        name: form.name.trim(),
        imageUrl,
        isActive: form.isActive,
        parentCategoryId: form.parentCategoryId ? Number(form.parentCategoryId) : null,
      }

      if (!payload.name) {
        throw new Error('Le nom de la catégorie est requis.')
      }

      const response = editCategory
        ? await updateAdminCategory(editCategory.id, payload)
        : await createAdminCategory(payload)

      const savedCategory = response.data
      setCategories((prev) => {
        if (editCategory) {
          return prev.map((item) => (item.id === savedCategory.id ? savedCategory : item))
        }
        return [savedCategory, ...prev]
      })

      setFeedback({ type: 'success', text: editCategory ? 'Catégorie mise à jour.' : 'Catégorie créée.' })
      resetForm()
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err.response?.data?.error ||
          err.message ||
          'Une erreur est survenue lors de l’enregistrement de la catégorie.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Supprimer la catégorie « ${category.name} » ? Cette action est irréversible.`)
    if (!confirmed) {
      return
    }

    try {
      await deleteAdminCategory(category.id)
      setCategories((prev) => prev.filter((item) => item.id !== category.id))
      if (editCategory?.id === category.id) {
        resetForm()
      }
      setFeedback({ type: 'success', text: 'Catégorie supprimée.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Impossible de supprimer la catégorie.' })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Catégories</h1>
          <p className="text-sm text-gray-500">Créer, modifier ou supprimer une catégorie avec photo.</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-text mb-4">Chargement...</p>}
      {!loading && error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">{editCategory ? 'Modifier une catégorie' : 'Nouvelle catégorie'}</h2>

        {feedback && (
          <div
            className={`mb-4 rounded border px-3 py-2 text-sm ${
              feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              name="name"
              value={form.name}
              onChange={handleInputChange}
              disabled={saving}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Nom de la catégorie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <div className="mt-1 flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Actif
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Grande catégorie parente</label>
            <select
              name="parentCategoryId"
              value={form.parentCategoryId}
              onChange={handleInputChange}
              disabled={saving}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Aucune grande catégorie</option>
              {parentCategories.filter((parent) => parent.isActive !== false).map((parent) => (
                <option key={parent.id} value={parent.id}>{parent.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Photo de catégorie</label>
            <div className="mt-1 flex items-center gap-4">
              <button
                type="button"
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <label className="cursor-pointer">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
                  Choisir un fichier
                </label>
              </button>
              <span className="text-sm text-gray-500">JPG, PNG ou WEBP, max 5 Mo.</span>
            </div>
            {(previewUrl || form.imageUrl) && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={previewUrl || form.imageUrl}
                  alt="Aperçu catégorie"
                  className="h-20 w-20 rounded object-cover border"
                />
                <div className="text-sm text-gray-600">Aperçu de l'image sélectionnée.</div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {editCategory && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#B30808] px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : editCategory ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow-sm p-4">

              <div className="mt-6 rounded bg-white p-4 shadow-sm">
                <h2 className="mb-1 text-lg font-semibold">Grandes catégories affichées sur l'accueil</h2>
                <p className="mb-4 text-sm text-gray-500">Les images et statuts sont utilisés directement par « Explorez par catégorie ».</p>
                <div className="space-y-3">
                  {parentCategories.map((parent) => (
                    <div key={parent.id} className="flex flex-wrap items-center gap-3 border-t py-3">
                      {parent.imageUrl && <img src={parent.imageUrl} alt={parent.name} className="h-12 w-12 rounded object-cover" />}
                      <span className="min-w-40 flex-1 font-medium">{parent.name}</span>
                      <label className="text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={Boolean(parent.isActive)}
                          onChange={(event) => setParentCategories((current) => current.map((item) => item.id === parent.id ? { ...item, isActive: event.target.checked } : item))}
                          className="mr-2"
                        />
                        Actif
                      </label>
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleParentFileChange(parent.id, event)} className="text-sm" />
                      <button type="button" onClick={() => handleParentSave(parent)} className="rounded bg-[#B30808] px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Enregistrer</button>
                    </div>
                  ))}
                </div>
              </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th>Photo</th>
              <th>Nom</th>
              <th>Slug</th>
              <th>Grande catégorie</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="py-3">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="h-12 w-12 rounded object-cover border" />
                  ) : (
                    <span className="text-xs text-gray-400">Aucune</span>
                  )}
                </td>
                <td className="py-3">{category.name}</td>
                <td className="py-3">{category.slug}</td>
                <td className="py-3">{category.parentCategoryName || 'Aucune'}</td>
                <td className="py-3">{category.isActive ? 'Actif' : 'Inactif'}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    className="mr-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminCategoriesPage
