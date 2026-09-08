import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import AddProductForm from '../../components/vendeur/AddProductForm'
import { createProductVariant, deleteProduct, fetchProductById, fetchProductVariants, updateProduct, updateProductVariant } from '../../utils/api'

function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function loadProduct() {
      try {
        const [{ data: productData }, variantData] = await Promise.all([
          fetchProductById(id),
          fetchProductVariants(id),
        ])

        setProduct(productData)
        setVariants(Array.isArray(variantData) ? variantData : [])
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  if (!loading && !product) {
    return <Navigate to="/vendeur/dashboard" replace />
  }

  async function handleSubmit(payload, editedVariants) {
    await updateProduct(id, payload)
    await Promise.all(editedVariants.filter((variant) => !String(variant.id).startsWith('new-')).map((variant) => updateProductVariant(id, variant.id, {
      combinationLabel: variant.combinationLabel,
      price: Number(variant.price),
      stockQuantity: Number(variant.stockQuantity || 0),
    })))
    await Promise.all(editedVariants.filter((variant) => String(variant.id).startsWith('new-')).map((variant) => createProductVariant(id, {
      combinationLabel: variant.combinationLabel,
      price: Number(variant.price),
      stockQuantity: Number(variant.stockQuantity || 0),
    })))
    navigate('/vendeur/dashboard', { replace: true, state: { productSuccess: true, message: 'Produit modifié avec succès' } })
  }

  async function handleDelete() {
    try {
      await deleteProduct(id)
      navigate('/vendeur/dashboard', {
        replace: true,
        state: { productSuccess: true, message: 'Produit supprimé avec succès' },
      })
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Impossible de supprimer ce produit.'

      setSubmitError(message)
    }
  }

  return (
    <main className="min-h-screen bg-off-white text-black-text">
      <header className="border-b border-gray-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[960px] items-center px-4 sm:px-6">
          <Link
            to="/vendeur/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-gray-border bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-black-text">Modifier le produit</h1>
          <p className="mt-2 text-sm text-gray-text">
            Mettez à jour les informations de votre produit.
          </p>

          <div className="mt-8">
            {submitError && (
              <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">
                {submitError}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-gray-text">Chargement du produit...</p>
            ) : (
              <AddProductForm mode="edit" initialProduct={product} initialVariants={variants} onSuccess={handleSubmit} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default EditProductPage
