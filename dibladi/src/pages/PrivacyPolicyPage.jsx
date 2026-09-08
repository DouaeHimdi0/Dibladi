import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const sectionTitleClass = 'mt-7 text-[17px] font-bold text-[#B30808]'
const bodyTextClass = 'text-[15px] leading-8 text-gray-text'
const listClass = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-8 text-gray-text marker:text-red-main'

function PrivacyPolicyPage() {
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
      <header className="bg-gradient-to-b from-red-light to-white px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-main transition-colors duration-200 hover:text-red-dark"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour
          </button>

          <div className="mt-7 flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-main shadow-sm">
              <Shield size={24} aria-hidden="true" />
            </span>
            <h1 className="text-3xl font-bold leading-tight text-black-text sm:text-4xl">
              Politique de confidentialité
            </h1>
          </div>
        </div>
      </header>

      <article className="mx-auto w-full max-w-[760px] px-6 py-10 sm:px-8 sm:py-12 lg:px-4">
        <section>
          <h2 className={sectionTitleClass}>1. Introduction</h2>
          <p className={bodyTextClass}>
            Bienvenue sur Dibladi. Nous accordons une grande importance à la protection de vos
            données personnelles et nous nous engageons à les traiter de manière responsable et
            sécurisée.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>2. Données collectées</h2>
          <p className={bodyTextClass}>
            Lors de l&apos;utilisation de notre plateforme, nous pouvons collecter les informations
            suivantes :
          </p>
          <ul className={listClass}>
            <li>Nom et prénom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
            <li>Informations relatives aux commandes</li>
            <li>Informations nécessaires à la création d&apos;un compte vendeur</li>
          </ul>
        </section>

        <section>
          <h2 className={sectionTitleClass}>3. Utilisation des données</h2>
          <p className={bodyTextClass}>
            Les informations collectées sont utilisées pour :
          </p>
          <ul className={listClass}>
            <li>créer et gérer votre compte</li>
            <li>traiter vos commandes</li>
            <li>assurer la livraison de vos achats</li>
            <li>communiquer avec vous en cas de besoin</li>
            <li>améliorer les services proposés par Dibladi</li>
          </ul>
        </section>

        <section>
          <h2 className={sectionTitleClass}>4. Confidentialité des données</h2>
          <p className={bodyTextClass}>
            Vos données personnelles sont traitées de manière confidentielle. Elles ne sont ni
            vendues ni louées à des tiers. Certaines informations peuvent être communiquées
            uniquement aux vendeurs concernés et aux partenaires de livraison lorsque cela est
            nécessaire au traitement et à l&apos;expédition de votre commande.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>5. Sécurité</h2>
          <p className={bodyTextClass}>
            Nous mettons en œuvre des mesures de sécurité appropriées afin de protéger vos données
            contre tout accès non autorisé, toute perte, toute modification ou toute divulgation.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>6. Cookies</h2>
          <p className={bodyTextClass}>
            Dibladi peut utiliser des cookies afin d&apos;améliorer votre navigation et de faciliter
            l&apos;utilisation de la plateforme.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>7. Vos droits</h2>
          <p className={bodyTextClass}>
            Vous pouvez demander l&apos;accès, la modification ou la suppression de vos données
            personnelles en nous contactant.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>8. Modifications</h2>
          <p className={bodyTextClass}>
            Cette Politique de confidentialité peut être mise à jour afin de refléter l&apos;
            évolution de nos services ou des exigences légales. La version la plus récente sera
            toujours disponible sur cette page.
          </p>
        </section>

        <section>
          <h2 className={sectionTitleClass}>9. Contact</h2>
          <p className={bodyTextClass}>
            Pour toute question concernant cette Politique de confidentialité ou le traitement de
            vos données personnelles, vous pouvez nous contacter à l&apos;adresse e-mail indiquée sur
            notre site.
          </p>
        </section>
      </article>
    </main>
  )
}

export default PrivacyPolicyPage
