import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AddProductForm from '../../components/vendeur/AddProductForm'
import { createProductWithVariants } from '../../utils/api'

function AddProductPage() {
  const navigate = useNavigate()
  async function handleSuccess(payload) {
    await createProductWithVariants(payload)
    navigate('/vendeur/dashboard', {
      replace: true,
      state: { productSuccess: true, message: 'Produit publié !' },
    })
  }

  return (
    <main className="min-h-screen bg-off-white text-black-text">
      <header className="mx-auto mb-6 flex max-w-[800px] items-center">
          <Link
            to="/vendeur/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au dashboard
          </Link>
      </header>
      <div className="mx-auto max-w-[800px] rounded-2xl border border-gray-border bg-white p-5 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold">Ajouter un produit</h1>
        <p className="mb-8 text-sm text-gray-text">Présentez votre produit en quelques étapes.</p>
        <AddProductForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}

export default AddProductPage
