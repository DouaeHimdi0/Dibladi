import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Dibladi] Erreur capturée:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-off-white px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-gray-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-light">
            <span className="text-3xl" role="img" aria-label="Erreur">⚠️</span>
          </div>

          <h1 className="mt-5 text-xl font-bold text-black-text">
            Oups, quelque chose s'est mal passé
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-gray-text">
            Une erreur inattendue est survenue. Veuillez rafraîchir la page ou revenir à l'accueil.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-main px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-dark"
            >
              Rafraîchir la page
            </button>

            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-red-main bg-white px-5 py-3 text-sm font-semibold text-red-main transition-colors duration-200 hover:bg-red-light"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
