import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import GoogleAuthButton from '../components/GoogleAuthButton'
import OrSeparator from '../components/OrSeparator'
import useAuth from '../hooks/useAuth'
import { USER_ROLES } from '../context/AuthContext'
import { registerClient, login as loginRequest } from '../utils/api'

const initialFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
}

const inputClassName =
  'mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function PasswordField({ label, name, value, onChange, error, showPassword, onToggleVisibility }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-black-text">{label}</span>
      <div className="relative mt-1">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={name === 'password' ? 'new-password' : 'new-password'}
          className={`${inputClassName} pr-10`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text transition-colors duration-200 hover:text-black-text"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-main">{error}</p>}
    </label>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function validateForm() {
    const nextErrors = {}
    const email = formValues.email.trim()
    const password = formValues.password
    const confirmPassword = formValues.confirmPassword

    if (!email) {
      nextErrors.email = 'Ce champ est obligatoire.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Veuillez saisir une adresse email valide.'
    }

    if (!password) {
      nextErrors.password = 'Ce champ est obligatoire.'
    } else if (password.length < 8) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Ce champ est obligatoire.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function completeSignup(data) {
    setErrors({})
    setSubmitting(true)

    try {
      const response = await registerClient({
        email: data.email,
        password: data.password,
        firstName: data.name?.split(' ')[0] ?? '',
        lastName: data.name?.split(' ').slice(1).join(' ') ?? '',
        phone: '',
      })

      if (data.authMethod === 'google') {
        navigate('/', { replace: true })
        return
      }

      const { data: authData } = await loginRequest({
        email: data.email,
        password: data.password,
      })

      login(
        { email: authData.email, name: data.email.split('@')[0] },
        authData.role,
        authData.token,
      )

      navigate('/', { replace: true })
    } catch (error) {
      const backendMessage = error.response?.data?.error || error.response?.data?.message
      setErrors({
        form: backendMessage || 'Une erreur est survenue lors de l’inscription.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogleSuccess(userData) {
    completeSignup({
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      authMethod: 'google',
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    completeSignup({
      email: formValues.email.trim(),
      password: formValues.password,
      authMethod: 'email',
    })
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
            <h1 className="text-2xl font-bold text-black-text">Créer un compte</h1>
            <p className="mt-2 text-sm text-gray-text">
              Inscrivez-vous pour suivre vos commandes et profiter de DiblaDi.
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
                  value={formValues.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={inputClassName}
                />
                {errors.email && <p className="mt-1 text-xs text-red-main">{errors.email}</p>}
              </label>

              <PasswordField
                label="Mot de passe"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                error={errors.password}
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword((visible) => !visible)}
              />

              <PasswordField
                label="Confirmation du mot de passe"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)}
              />

              {errors.form && <p className="text-xs text-red-main">{errors.form}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-11 w-full rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:opacity-60"
              >
                {submitting ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-text">
              Déjà inscrit ?{' '}
              <Link to="/connexion" className="font-medium text-red-main transition-colors duration-200 hover:text-red-dark">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default SignupPage
