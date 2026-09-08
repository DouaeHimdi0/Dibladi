import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const HERO_SLIDES = [
  {
    url: '/images/hero/slide1.png',
    alt: 'Textiles colorés au souk marocain',
  },
  {
    url: '/images/hero/slide2.png',
    alt: 'Artisanat marocain',
  },
  {
    url: '/images/hero/slide3.png',
    alt: 'Épices et produits du souk',
  },
  {
    url: '/images/hero/slide4.png',
    alt: 'Épices et produits du souk',
  },
]

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length)
    }, 4000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="relative h-[70vh] overflow-hidden md:h-[75vh]">
      <div className="absolute inset-0" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_SLIDES[activeIndex].url})` }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/35 to-transparent md:via-white/45 lg:via-white/35"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent md:from-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-8 lg:px-20">
        <motion.div
          className="max-w-lg md:max-w-xl"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="inline-flex w-fit rounded-full bg-gradient-to-r from-red-main to-green-accent p-[1.5px] shadow-[0_4px_14px_rgba(253,62,62,0.28)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-light px-3 py-1 text-[13px] font-medium text-red-main">

              100% Marocain . Exclusivités locales
            </span>
          </span>

          <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.08] text-black-text sm:text-[2.5rem] md:text-[2.7rem] lg:text-[3rem]">
            Découvrez les tendances du <span className="text-red-main">Maroc</span>, livrées chez vous
          </h1>

        <p className="mt-3 max-w-[440px] text-base font-semibold leading-relaxed text-black sm:text-lg">
  Profitez des offres exclusives, de prix attractifs et de créations 100% marocaines,
  sélectionnées pour vous par des artisans et marques locales.
</p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <Link
              to="/categorie/tout"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-main px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-dark sm:px-7 sm:py-[14px]"
            >
              Découvrir les offres
            </Link>
            <Link
              to="/vendeur/inscription"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-red-main bg-white px-5 py-3 text-sm font-semibold text-red-main transition-colors duration-200 hover:bg-red-light sm:px-7 sm:py-[14px]"
            >
              Vendre sur DiblaDi
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-6">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.url}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Afficher la photo ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-8 bg-red-main' : 'w-2.5 bg-white/80 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection