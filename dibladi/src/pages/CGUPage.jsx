import { FileText } from 'lucide-react'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'

function CGUPage() {
  return (
    <LegalPageLayout title="Conditions générales d'utilisation" icon={FileText}>
      <p className="text-sm text-gray-text">
        Dernière mise à jour : juin 2026. Les présentes conditions régissent l&apos;accès et
        l&apos;utilisation de la marketplace DiblaDi.
      </p>

      <LegalSection title="1. Objet">
        <p>
          DiblaDi est une plateforme de mise en relation entre acheteurs et vendeurs proposant
          des produits et services au Maroc. L&apos;utilisation du site implique l&apos;acceptation
          pleine et entière des présentes conditions générales d&apos;utilisation.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service">
        <p>
          Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à
          Internet. DiblaDi se réserve le droit de suspendre, limiter ou interrompre l&apos;accès
          au service pour maintenance, mise à jour ou en cas de non-respect des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="3. Comptes utilisateurs">
        <p>
          La création d&apos;un compte peut être requise pour certaines fonctionnalités (achat,
          vente, suivi de commandes). L&apos;utilisateur s&apos;engage à fournir des informations
          exactes et à maintenir la confidentialité de ses identifiants.
        </p>
      </LegalSection>

      <LegalSection title="4. Commandes et paiements">
        <p>
          Les transactions sont conclues directement entre acheteurs et vendeurs. DiblaDi facilite
          la mise en relation et le suivi des commandes. Les modalités de paiement et de livraison
          sont précisées sur chaque fiche produit et lors du passage de commande.
        </p>
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site (textes, visuels, logo, structure) est protégé par
          le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilité">
        <p>
          DiblaDi agit en qualité d&apos;intermédiaire technique. La responsabilité des produits
          vendus incombe aux vendeurs inscrits sur la plateforme, dans les limites prévues par la
          loi marocaine en vigueur.
        </p>
      </LegalSection>

      <LegalSection title="7. Modification des CGU">
        <p>
          DiblaDi peut modifier les présentes conditions à tout moment. Les utilisateurs seront
          informés des changements substantiels par tout moyen approprié. La poursuite de
          l&apos;utilisation du service vaut acceptation des nouvelles conditions.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Pour toute question relative aux présentes CGU :{' '}
          <a
            href="mailto:contact@dibladi.com"
            className="font-medium text-red-main transition-colors hover:text-red-dark"
          >
            contact@dibladi.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}

export default CGUPage
