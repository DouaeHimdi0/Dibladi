import { Scale } from 'lucide-react'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'

function LegalNoticesPage() {
  return (
    <LegalPageLayout title="Mentions légales" icon={Scale}>
      <p className="text-sm text-gray-text">
        Conformément aux dispositions légales en vigueur, les informations suivantes sont portées
        à la connaissance des utilisateurs du site DiblaDi.
      </p>

      <LegalSection title="1. Éditeur du site">
        <p>
          <strong className="font-semibold text-black-text">DiblaDi</strong>
          <br />
          Marketplace 100% marocaine
          <br />
          Casablanca, Maroc
          <br />
          E-mail :{' '}
          <a
            href="mailto:contact@dibladi.com"
            className="font-medium text-red-main transition-colors hover:text-red-dark"
          >
            contact@dibladi.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. Directeur de la publication">
        <p>Le directeur de la publication est le représentant légal de DiblaDi.</p>
      </LegalSection>

      <LegalSection title="3. Hébergement">
        <p>
          Le site est hébergé par un prestataire technique dont les coordonnées complètes seront
          communiquées sur demande. Les données sont stockées dans des infrastructures conformes
          aux standards de sécurité du secteur.
        </p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p>
          La marque DiblaDi, le logo, les textes, graphismes et l&apos;architecture du site sont
          la propriété exclusive de DiblaDi ou de ses partenaires. Toute exploitation non
          autorisée est constitutive d&apos;une contrefaçon.
        </p>
      </LegalSection>

      <LegalSection title="5. Liens hypertextes">
        <p>
          Le site peut contenir des liens vers des sites tiers. DiblaDi n&apos;exerce aucun
          contrôle sur ces contenus externes et décline toute responsabilité quant à leur
          accessibilité ou à leur conformité légale.
        </p>
      </LegalSection>

      <LegalSection title="6. Droit applicable">
        <p>
          Les présentes mentions légales sont régies par le droit marocain. En cas de litige, et
          à défaut de résolution amiable, les tribunaux compétents du Royaume du Maroc seront
          seuls compétents.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}

export default LegalNoticesPage
