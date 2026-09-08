import { motion } from 'framer-motion'
import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const footerLinkClass =
  'inline-flex items-center gap-2 text-[15px] text-white/100 transition-all duration-200 hover:translate-x-1 hover:text-red-main'

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 8.5V7c0-.83.67-1.5 1.5-1.5h1.5V2.5H15c-2.49 0-4.5 2.01-4.5 4.5v1.5H8v3h2.5v10h3v-10H16l.5-3h-3Z" />
    </svg>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FooterWave() {
  return (
    <div className="relative -mb-px h-20 w-full overflow-hidden leading-none" aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="rgb(253 62 62)" />
      </svg>
    </div>
  )
}

const socialLinks = [
  {
    href: 'https://www.facebook.com/share/1GQmgsnAhe/',
    icon: FacebookIcon,
    label: 'Facebook',
  },
  {
    href: 'https://www.instagram.com/noorbag_?igsh=MW4ybmxkaTJjMmljMA==',
    icon: InstagramIcon,
    label: 'Instagram',
  },
]

const contactItems = [
  { icon: Mail, text: 'contact.dibladi@gmail.com' },
  { icon: Phone, text: '+212 781151182' },
  { icon: MapPin, text: 'Maroc' },
]

function ColumnTitle({ children }) {
  return <h3 className="text-base font-bold text-white">{children}</h3>
}

function Footer() {
  return (
    <>
      <FooterWave />
      <motion.footer
        className="relative overflow-hidden bg-[#1A1A1A] text-off-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(179,8,8,0.15)_0%,transparent_50%,rgba(253,62,62,0.08)_100%)]"
          aria-hidden="true"
        />
        <img
          src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.06]"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          <section>
            <BrandLogo className="shrink-0" textClassName="brand-logo text-[26px] text-red-main" />

            <p className="mt-2 text-sm leading-6 text-white/100">Dibladi est une marketplace 100 % marocaine qui regroupe des marques locales fabriquées au Maroc et permet de les découvrir et de les acheter facilement en ligne.</p>

            <div className="mt-5 flex items-center gap-3">
  {socialLinks.map(({ href, icon: Icon, label }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-main text-white transition-all duration-200 hover:scale-110 hover:bg-red-dark"
      aria-label={label}
    >
      <Icon size={16} aria-hidden="true" />
    </a>
  ))}
</div>
          </section>

          <section>
            <ColumnTitle>Explorer</ColumnTitle>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className={footerLinkClass}>
                  <ChevronRight size={14} className="shrink-0 text-red-main" aria-hidden="true" />
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link to="/categorie/tout" className={footerLinkClass}>
                  <ChevronRight size={14} className="shrink-0 text-red-main" aria-hidden="true" />
                  <span>Catégories</span>
                </Link>
              </li>
              <li>
                <Link to="/vendeur/inscription" className={footerLinkClass}>
                  <ChevronRight size={14} className="shrink-0 text-red-main" aria-hidden="true" />
                  <span>Vendre sur Dibladi</span>
                </Link>
              </li>
              <li>
                <Link to="/mon-compte" className={footerLinkClass}>
                  <ChevronRight size={14} className="shrink-0 text-red-main" aria-hidden="true" />
                  <span>Mon compte</span>
                </Link>
              </li>
              <li>
                <Link to="/#faq" className={footerLinkClass}>
                  <ChevronRight size={14} className="shrink-0 text-red-main" aria-hidden="true" />
                  <span>FAQ</span>
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <ColumnTitle>Contact</ColumnTitle>
            <ul className="mt-4 space-y-4 text-sm text-white/100">
              {contactItems.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-main text-white">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="relative z-10">
          <div className="h-px bg-white/10" aria-hidden="true" />
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-4 text-sm text-white/100 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© 2026 Dibladi — Tous droits réservés.</p>
            <Link
              to="/confidentialite"
              className="transition-colors duration-200 hover:text-red-main"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </motion.footer>
    </>
  )
}

export default Footer
