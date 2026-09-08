import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SectionTitle from './SectionTitle'

const faqItems = [
  {
    question: "C'est quoi Dibladi ?",
    answer:
      'Dibladi valorise les marques marocaines en leur offrant une plateforme dédiée où les consommateurs peuvent découvrir des produits locaux de qualité, conçus et fabriqués au Maroc.',
  },
  {
    question: 'Pourquoi choisir Dibladi ?',
    answer:
      "Dibladi facilite la découverte des marques marocaines et regroupe une offre variée de produits locaux au même endroit, avec une expérience d'achat simple et moderne.",
  },
  {
    question: 'Qui peut vendre sur Dibladi ?',
    answer:
      'Les marques et vendeurs basés au Maroc proposant des produits fabriqués localement peuvent rejoindre Dibladi pour vendre sur la plateforme.',
  },
  {
    question: 'Comment se déroule la livraison des commandes ?',
    answer:
      "Toutes les commandes sont expédiées partout au Maroc. Un agent de livraison vous contactera par téléphone afin de vous livrer directement chez vous ou à l'adresse de votre choix.",
  },
  {
    question: "Comment s'effectue le paiement sur Dibladi ?",
    answer:
      'Nous proposons le paiement à la livraison (Cash on Delivery) en toute sécurité : vous payez uniquement à la réception de votre commande.',
  },
  {
    question: 'Est-ce que tous les produits sont fabriqués au Maroc ?',
    answer:
      'Oui, tous les produits proposés sur Dibladi sont rigoureusement sélectionnés et 100 % fabriqués au Maroc par des créateurs, des artisans et des marques locales.',
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <li className="border-b border-gray-border py-5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[22px] font-bold text-black-text">
          {item.question}
        </span>

        <ChevronDown
          size={20}
          className={`shrink-0 text-red-main transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={item.question}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pt-3 pb-1 text-[17px] font-semibold leading-7 text-gray-text">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="bg-white py-6">
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6 lg:px-0">
        <div className="text-center">
          <SectionTitle
            title="FAQ"
            subtitle="Tout ce que vous devez savoir sur Dibladi"
            align="center"
            color="green"
          />
        </div>

        <ul className="mt-10 bg-white">
          {faqItems.map((item, index) => (
            <FAQItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((currentIndex) =>
                  currentIndex === index ? -1 : index
                )
              }
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default FAQSection