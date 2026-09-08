import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function LegalPageLayout({ title, icon: Icon, children }) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <main className="min-h-screen bg-off-white text-black-text">
      <header className="bg-gradient-to-r from-red-light to-orange-accent/10 px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour
          </button>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-red-main shadow-sm">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-bold leading-tight text-black-text sm:text-4xl">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8 sm:py-12 lg:px-4">
        <div className="space-y-8 text-[15px] leading-7 text-gray-text">{children}</div>
      </article>
    </main>
  )
}

function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-black-text">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export { LegalSection }
export default LegalPageLayout
