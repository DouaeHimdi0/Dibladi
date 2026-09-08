import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

async function fetchGoogleUserInfo(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Impossible de récupérer les informations du compte Google.')
  }

  const data = await response.json()

  return {
    email: data.email,
    name: data.name ?? '',
    picture: data.picture ?? '',
  }
}

function GoogleAuthButton({ onGoogleSuccess, disabled = false }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const login = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      setErrorMessage('')

      // NOTE: ceci est une vraie intégration Google OAuth (popup natif 'Choose an account').
      // La création/vérification du compte côté serveur sera branchée une fois le backend
      // Spring Boot prêt (validation du token, création utilisateur en base, émission du JWT DiblaDi).
      try {
        const userData = await fetchGoogleUserInfo(tokenResponse.access_token)
        onGoogleSuccess(userData)
      } catch {
        setErrorMessage('Impossible de récupérer vos informations Google. Veuillez réessayer.')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      setIsLoading(false)
      setErrorMessage('La connexion Google a échoué. Veuillez réessayer.')
    },
    onNonOAuthError: (error) => {
      setIsLoading(false)

      if (error.type !== 'popup_closed') {
        setErrorMessage('La connexion Google a été interrompue. Veuillez réessayer.')
      }
    },
  })

  function handleClick() {
    if (disabled || isLoading) {
      return
    }

    setErrorMessage('')
    login()
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-gray-border bg-white text-sm font-medium text-black-text transition-colors duration-200 hover:bg-gray-bg disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-gray-text" aria-hidden="true" />
        ) : (
          <GoogleLogo />
        )}
        <span>{isLoading ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
      </button>

      {errorMessage && <p className="mt-2 text-xs text-gray-text">{errorMessage}</p>}
    </div>
  )
}

export default GoogleAuthButton
