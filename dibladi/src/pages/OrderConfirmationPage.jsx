import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirmationState = location.state

  useEffect(() => {
    if (!confirmationState) {
      navigate('/', { replace: true })
    }
  }, [confirmationState, navigate])

  if (!confirmationState) {
    return null
  }

  return (
    <main className="bg-off-white px-4 py-12 text-black-text sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-gray-border bg-white px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <CheckCircle size={56} className="text-red-main" aria-hidden="true" />
        </motion.div>

        <h1 className="mt-5 text-3xl font-bold text-black-text">Commande confirmée !</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-gray-text">
          Votre commande a bien été enregistrée.
        </p>

        <div className="mt-6 rounded-xl border border-gray-border bg-gray-bg px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-[2px] text-gray-text">Numéro de commande</p>
          <p className="mt-1 text-xl font-bold text-black-text">{confirmationState.orderNumber}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-lg bg-red-main px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
          >
            Retour à l'accueil
          </Link>
          <Link to="/mes-commandes" className="text-sm font-medium text-red-main transition-colors duration-200 hover:text-red-dark">
            Mes commandes
          </Link>
        </div>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
