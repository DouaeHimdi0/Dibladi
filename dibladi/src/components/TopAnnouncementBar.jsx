import { Percent, Tag, Truck, Wallet } from 'lucide-react'

const announcements = [
  { icon: Truck, text: 'Livraison rapide partout au Maroc' },
  { icon: Wallet, text: 'Paiement à la livraison disponible' },
  { icon: Tag, text: 'Soldes et offres exclusives chaque semaine' },
  { icon: Percent, text: 'Jusqu\'à -30% sur une sélection de produits' },
]

const duplicatedAnnouncements = [...announcements, ...announcements]

function TopAnnouncementBar() {
  return (
    <div
      className="sticky top-0 z-[60] h-9 w-full overflow-hidden bg-gradient-to-r from-red-main to-orange-accent"
      role="region"
      aria-label="Annonces promotionnelles"
    >
      <div className="announcement-marquee h-full">
        <div className="announcement-track flex h-full items-center">
          {duplicatedAnnouncements.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={`${item.text}-${index}`} className="flex items-center">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-6 text-sm font-medium text-white sm:px-8 sm:text-sm">
                  <Icon size={14} aria-hidden="true" />
                  {item.text}
                </span>
                <span className="text-white/50" aria-hidden="true">
                  •
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TopAnnouncementBar
