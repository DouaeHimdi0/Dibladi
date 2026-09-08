import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import GoogleAuthButton from '../components/GoogleAuthButton'
import OrSeparator from '../components/OrSeparator'
import useAuth from '../hooks/useAuth'
import { USER_ROLES } from '../context/AuthContext'
import { login as loginRequest } from '../utils/api'

const inputClassName =
  'mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleGoogleSuccess(userData) {
    login(userData, USER_ROLES.CLIENT)
    navigate('/', { replace: true })
  }

  function validateForm() {
    const nextErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      nextErrors.email = 'Ce champ est obligatoire.'
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Veuillez saisir une adresse email valide.'
    }

    if (!password) {
      nextErrors.password = 'Ce champ est obligatoire.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function redirectByRole(role) {
    const normalizedRole = String(role || '').toUpperCase()

    if (normalizedRole === USER_ROLES.ADMIN) {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    if (normalizedRole === USER_ROLES.VENDOR) {
      navigate('/vendeur/dashboard', { replace: true })
      return
    }

    navigate('/', { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const trimmedEmail = email.trim()
    setLoading(true)
    setErrors({})

    try {
      const { data } = await loginRequest({
        email: trimmedEmail,
        password,
      })

      login(
        { email: data.email, name: trimmedEmail.split('@')[0] },
        data.role,
        data.token,
      )
      redirectByRole(data.role)
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ form: 'Email ou mot de passe incorrect' })
      } else {
        setErrors({ form: 'Email ou mot de passe incorrect' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-off-white px-4 py-10 text-black-text">
      <div className="w-full max-w-[520px] rounded-2xl border border-gray-border bg-white px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex justify-center">
          <BrandLogo className="shrink-0" textClassName="brand-logo text-[28px] text-red-main" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-black-text">Connexion</h1>
            <p className="mt-2 text-sm text-gray-text">
              Connectez-vous pour accéder à votre compte DiblaDi.
            </p>
          </div>

          <div className="space-y-4">
            <GoogleAuthButton onGoogleSuccess={handleGoogleSuccess} />

            <OrSeparator />

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="text-sm font-medium text-black-text">Adresse email</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className={inputClassName}
                />
                {errors.email && <p className="mt-1 text-xs text-red-main">{errors.email}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-black-text">Mot de passe</span>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className={`${inputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text transition-colors duration-200 hover:text-black-text"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-main">{errors.password}</p>}
              </label>

              {errors.form && <p className="text-xs text-red-main">{errors.form}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:opacity-60"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-text">
              Pas encore de compte ?{' '}
              <Link
                to="/inscription"
                className="font-medium text-red-main transition-colors duration-200 hover:text-red-dark"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default LoginPage
