import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LogOut,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
  Tag,
  Loader2,
  Menu,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import useCart from '../hooks/useCart'
import useAuth from '../hooks/useAuth'
import { fetchParentCategories, globalSearch } from '../utils/api'
import { changeLanguage, getSavedLanguage } from '../utils/googleTranslate'
import frFlag from '../assets/flags/fr.png'
import maFlag from '../assets/flags/ma.png'
import enFlag from '../assets/flags/en.png'

const categoryHoverTransition = {
  type: 'spring',
  stiffness: 420,
  damping: 28,
  duration: 0.25,
}

const CATEGORY_ORDER = [
  'artisanat-terroir',
  'mode-vetements',
  'beaute-bien-etre',
  'bijoux-sacs-accessoires',
  'chaussures',
  'maison-lifestyle',
]

function CategoryNavButton({ category, index, isActive, onClick }) {
  const rotateY = index % 2 === 0 ? 6 : -6

  return (
    <li className="[transform-style:preserve-3d]">
      <motion.button
        type="button"
        onClick={() => onClick(category)}
 className={`font-category whitespace-nowrap border-b-[3px] px-4 py-[10px] text-base transition-[color,box-shadow,letter-spacing,font-weight] duration-200 sm:px-5 sm:text-[18px] ${
  isActive
    ? 'rounded-md border-red-main bg-red-light font-extrabold tracking-[0.02em] text-red-main'
    : 'border-transparent font-extrabold text-gray-900 hover:border-red-main hover:tracking-[0.02em] hover:text-red-main hover:shadow-[0_6px_16px_rgba(253,62,62,0.15)]'
}`}
        whileHover={{
          scale: 1.08,
          rotateY,
          y: -3,
        }}
        transition={categoryHoverTransition}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {category.name}
      </motion.button>
    </li>
  )
}

const languageOptions = [
  { code: 'FR', label: 'Français', flag: frFlag },
  { code: 'AR', label: 'العربية', flag: maFlag },
  { code: 'EN', label: 'English', flag: enFlag },
]

// TODO: brancher react-i18next pour la traduction réelle
// lors de l'intégration backend Spring Boot

function getUserDisplayName(user) {
  if (user.name) {
    const firstName = user.name.trim().split(/\s+/)[0]
    if (firstName) {
      return firstName
    }
  }

  const localPart = user.email.split('@')[0]
  return localPart.length > 14 ? `${localPart.slice(0, 14)}…` : localPart
}

function RoleBadge({ role }) {
  if (role === 'VENDOR') {
    return (
      <span className="rounded border border-red-main bg-red-light px-1.5 py-0.5 text-[11px] font-medium leading-none text-red-main">
        Vendeur
      </span>
    )
  }

  if (role === 'ADMIN') {
    return (
      <span className="rounded border border-red-main bg-red-light px-1.5 py-0.5 text-[11px] font-medium leading-none text-red-main">
        Admin
      </span>
    )
  }

  return (
    <span className="rounded border border-gray-border bg-gray-bg px-1.5 py-0.5 text-[11px] font-medium leading-none text-gray-text">
      Client
    </span>
  )
}

function categoryFromPathSlug(slug, categories) {
  const category = categories.find((item) => item.slug === slug)

  if (category) {
    return category.name
  }

  return categories.find((item) => item.subcategories?.some((subcategory) => subcategory.slug === slug))?.name ?? null
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(() => getSavedLanguage().toUpperCase())
  const { cartCount } = useCart()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const languageRef = useRef(null)
  const categoryScrollRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [openCategoryId, setOpenCategoryId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoryNavRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchContainerRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    setCategoriesLoading(true)

    fetchParentCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [])

  function handleLanguageChange(code) {
    setSelectedLanguage(code.toUpperCase())
    changeLanguage(code)
    setIsLanguageOpen(false)
    window.setTimeout(() => window.location.reload(), 50)
  }

  const activeCategories = useMemo(() => {
    const active = categories.filter((category) => category.isActive !== false)
    return active.sort((a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug))
  }, [categories])

  const activeCategory = useMemo(() => {
    const match = location.pathname.match(/^\/categorie\/([^/]+)$/)

    if (!match) {
      return null
    }

    return categoryFromPathSlug(decodeURIComponent(match[1]), activeCategories)
  }, [location.pathname, activeCategories])

  function handleCategoryClick(category) {
    navigate(`/categorie-parent/${category.slug}`)
  }

  function scrollCategories(direction) {
    categoryScrollRef.current?.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false)
      }
      if (categoryNavRef.current && !categoryNavRef.current.contains(event.target)) {
        setOpenCategoryId(null)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowResults(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setShowResults(false)
      setSearchResults(null)
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    setIsSearching(true)
    setShowResults(true)

    searchTimeoutRef.current = setTimeout(() => {
      globalSearch(searchQuery)
        .then(({ data }) => setSearchResults(data))
        .catch(() => setSearchResults(null))
        .finally(() => setIsSearching(false))
    }, 300)

    return () => clearTimeout(searchTimeoutRef.current)
  }, [searchQuery])

  useEffect(() => {
    setIsMobileSearchOpen(false)
    setShowResults(false)
    setSearchQuery('')
  }, [location.pathname])

  useEffect(() => {
    const scrollElement = categoryScrollRef.current

    if (!scrollElement) {
      return undefined
    }

    function handleWheel(event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return
      }

      event.preventDefault()
      scrollElement.scrollLeft += event.deltaY
    }

    scrollElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      scrollElement.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <header className="sticky top-0 z-[9999] isolate overflow-visible bg-white" style={{ zIndex: 9999 }}>
      <div className="relative z-[9999] bg-white">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1280px] items-center gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
          <BrandLogo className="min-w-0 shrink-0" textClassName="brand-logo text-[21px] text-red-main sm:text-[28px]" />

          <div className="hidden min-w-0 flex-1 justify-center md:flex relative" ref={searchContainerRef}>
            <label className="group relative w-full max-w-[320px] lg:max-w-[480px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-main"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Rechercher des produits marocains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowResults(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim().length >= 1) {
                    const q = searchQuery.trim()
                    // If user is a client, allow navigating to their orders search
                    if (currentUser?.role === 'CLIENT') {
                      // If numeric -> treat as vendor id and open vendor page
                      if (/^\d+$/.test(q)) {
                        navigate(`/boutique/${q}`)
                      } else {
                        navigate(`/mes-commandes?q=${encodeURIComponent(q)}`)
                      }
                    } else {
                      navigate(`/recherche?q=${encodeURIComponent(q)}`)
                    }
                    setShowResults(false)
                  }
                }}
                className="h-10 w-full rounded-lg border border-gray-border bg-gray-bg pl-10 pr-10 text-sm text-black-text outline-none transition-colors duration-200 placeholder:text-gray-text focus:border-red-main lg:h-11"
              />
              {isSearching && (
                <Loader2
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-text"
                  aria-hidden="true"
                />
              )}
            </label>

            {showResults && searchQuery.length >= 2 && (
              <div
                className="absolute left-1/2 top-full mt-2 w-full max-w-[320px] -translate-x-1/2 overflow-y-auto rounded-xl border border-gray-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] lg:max-w-[480px]"
                style={{ maxHeight: '400px', zIndex: 9999 }}
              >
                {!isSearching && (!searchResults || (searchResults.products.length === 0 && searchResults.categories.length === 0 && searchResults.vendors.length === 0)) ? (
                  <div className="p-5 text-center text-sm text-gray-text">
                    Aucun résultat pour "{searchQuery}"
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {searchResults?.products?.length > 0 && (
                      <div className="flex flex-col border-b border-gray-border last:border-b-0">
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-text">
                          Produits
                        </div>
                        {searchResults.products.map(product => (
                          <div
                            key={product.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              navigate(`/produit/${product.id}`)
                              setShowResults(false)
                            }}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[#FFF0F0]"
                          >
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-md bg-gray-bg object-cover"
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-bold text-black-text">{product.name}</span>
                              <span className="truncate text-xs text-gray-text">{product.vendorShopName || 'Boutique'}</span>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-red-main">{product.price} MAD</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults?.categories?.length > 0 && (
                      <div className="flex flex-col border-b border-gray-border last:border-b-0">
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-text">
                          Catégories
                        </div>
                        {searchResults.categories.map(category => (
                          <div
                            key={category.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              navigate(`/categorie/${category.slug}`)
                              setShowResults(false)
                            }}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[#FFF0F0]"
                          >
                            <Tag size={16} className="text-red-main" />
                            <span className="text-sm font-medium text-black-text">{category.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults?.vendors?.length > 0 && (
                      <div className="flex flex-col border-b border-gray-border last:border-b-0">
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-text">
                          Boutiques
                        </div>
                        {searchResults.vendors.map(vendor => (
                          <div
                            key={vendor.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              navigate(`/boutique/${vendor.vendorId}`)
                              setShowResults(false)
                            }}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[#FFF0F0]"
                          >
                            <Store size={16} className="text-red-main" />
                            <span className="text-sm font-medium text-black-text">{vendor.shopName}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
                        setShowResults(false)
                      }}
                      className="cursor-pointer bg-[#FFF0F0] p-3 text-center text-sm font-bold text-red-main transition-colors duration-150 hover:bg-red-light"
                    >
                      Voir tous les résultats pour "{searchQuery}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-0 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-black-text transition-colors duration-200 hover:bg-red-light hover:text-red-main md:hidden"
              aria-label="Ouvrir la recherche"
              title="Recherche"
            >
              <Search size={20} aria-hidden="true" />
            </button>

              <div className="relative" ref={languageRef} style={{ zIndex: 9999 }}>
                <button
                  type="button"
                  onClick={() => setIsLanguageOpen((open) => !open)}
                  className="flex shrink-0 items-center gap-0 rounded-[8px] px-1 py-1.5 border border-[#E0E0E0] bg-transparent text-sm text-[#1A1A1A] transition-colors duration-200 hover:border-red-main sm:gap-2 sm:px-3"
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={languageOptions.find((l) => l.code === selectedLanguage)?.flag}
                      alt={languageOptions.find((l) => l.code === selectedLanguage)?.label}
                      style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 3 }}
                    />
                    <span className="font-medium">{selectedLanguage}</span>
                  </span>
                  <ChevronDown size={16} className="text-red-main" aria-hidden="true" />
                </button>

                {isLanguageOpen && (
                  <div
                    className="language-dropdown absolute right-0 top-full mt-2 min-w-[180px] rounded-[10px] border bg-white overflow-hidden"
                    style={{ borderColor: '#E0E0E0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {languageOptions.map((option) => {
                      const active = selectedLanguage === option.code
                      return (
                        <div
                          key={option.code}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            handleLanguageChange(option.code.toLowerCase())
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleLanguageChange(option.code.toLowerCase())
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-3 transition-colors duration-150 ${
                            active ? 'bg-[#FFF0F0] text-red-main' : 'text-[#1A1A1A] hover:bg-[#FFF0F0] hover:text-red-main'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={option.flag}
                            alt={option.label}
                            style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 3 }}
                          />
                          <span className="flex-1 text-sm">{option.label}</span>
                          <span style={{ fontSize: 12, color: 'rgba(51,51,51,0.75)' }}>{option.code}</span>
                          {active && <CheckCircle size={14} className="text-red-main ml-2" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {currentUser.role !== 'CLIENT' && (
                  currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full border border-gray-border object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-bg text-gray-text">
                      <User size={16} aria-hidden="true" />
                    </span>
                  )
                )}
                <div className="hidden items-center gap-1.5 sm:flex">
                  <span className="max-w-[88px] truncate text-sm font-medium text-black-text">
                    {getUserDisplayName(currentUser)}
                  </span>
                  <RoleBadge role={currentUser.role} />
                </div>
                <span className="sm:hidden">
                  <RoleBadge role={currentUser.role} />
                </span>

                {(currentUser.role === 'ADMIN' || currentUser.role === 'VENDOR') &&
                  !location.pathname.startsWith('/admin') &&
                  !location.pathname.startsWith('/vendeur') && (
                    <Link
                      to={currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/vendeur/dashboard'}
                      className={`inline-flex h-11 min-h-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors duration-200 ${
                        currentUser.role === 'ADMIN'
                          ? 'border-[#B30808] bg-[#B30808] text-white hover:bg-[#990606]'
                          : 'border-[#B30808] bg-white text-[#B30808] hover:bg-[#FFF0F0]'
                      }`}
                    >
                      {currentUser.role === 'ADMIN' ? 'Espace Admin' : 'Espace Vendeur'}
                    </Link>
                  )}
                {currentUser.role === 'CLIENT' && (
                  <Link
                    to="/mes-commandes"
                    className="inline-flex h-11 min-h-11 items-center justify-center rounded-md border border-red-main bg-white px-3 text-sm font-medium text-red-main transition-colors duration-200 hover:bg-red-light"
                  >
                    Mes commandes
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className={`inline-flex h-11 min-h-11 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors duration-200 ${
                    currentUser.role === 'ADMIN' ? 'bg-white text-[#B30808] border border-[#B30808] hover:bg-[#FFF0F0]' : 'bg-[#B30808] text-white hover:bg-[#990606]'
                  }`}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <LogOut size={16} className="sm:hidden" aria-hidden="true" />
                  <span className="hidden sm:inline">Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/connexion"
                    className="inline-flex h-10 min-h-10 w-10 shrink-0 items-center justify-center rounded-md border-[1.5px] border-red-main bg-white text-red-main transition-colors duration-200 hover:bg-red-main hover:text-white sm:h-11 sm:min-h-11 sm:w-auto sm:px-3 sm:gap-2"
                  aria-label="Se connecter"
                  title="Se connecter"
                >
                  <User size={18} aria-hidden="true" />
                  <span className="hidden sm:inline lg:hidden">Connexion</span>
                  <span className="hidden lg:inline">Se connecter</span>
                </Link>

                <Link
                  to="/vendeur/inscription"
                  className="inline-flex h-10 min-h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-main text-white transition-colors duration-200 hover:bg-red-dark sm:h-11 sm:min-h-11 sm:w-auto sm:px-3 sm:gap-2"
                  aria-label="Vendre sur DiblaDi"
                  title="Vendre sur DiblaDi"
                >
                  <Store size={18} aria-hidden="true" />
                  <span className="hidden sm:inline lg:hidden">Vendre</span>
                  <span className="hidden lg:inline">Vendre sur DiblaDi</span>
                </Link>
              </div>
            )}

            <Link
              to="/panier"
              className="relative inline-flex h-10 min-h-10 w-10 shrink-0 items-center justify-center rounded-md text-black-text transition-colors duration-200 hover:text-red-main sm:h-11 sm:min-h-11"
              aria-label="Voir le panier"
            >
              <ShoppingCart size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-main px-1 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isMobileSearchOpen && (
            <motion.div
              className="border-t border-gray-border bg-white px-4 py-3 md:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-gray-border bg-gray-bg px-3">
                <Search size={18} className="shrink-0 text-red-main" aria-hidden="true" />
                <input
                  type="search"
                  autoFocus
                  placeholder="Rechercher des produits marocains..."
                  className="h-11 flex-1 bg-transparent text-sm text-black-text outline-none placeholder:text-gray-text"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-text transition-colors duration-200 hover:text-red-main"
                  aria-label="Fermer la recherche"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-main via-orange-accent/80 to-orange-accent"
          aria-hidden="true"
        />
      </div>

      <div ref={categoryNavRef} className="border-b border-gray-border bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-2 md:px-6">
          <button type="button" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setMobileMenuOpen((open) => !open) }} onClick={(event) => { event.preventDefault(); event.stopPropagation() }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-border px-3 text-sm font-semibold text-black-text md:hidden" aria-label={mobileMenuOpen ? 'Fermer les catégories' : 'Ouvrir les catégories'}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />} Catégories
          </button>
          <nav className="hide-scrollbar hidden overflow-x-auto md:block" aria-label="Catégories">
            <ul className="flex w-max min-w-full flex-nowrap items-center justify-start gap-1">
              {!categoriesLoading && activeCategories.map((category) => (
                <li key={category.id} className="relative">
                  <button type="button" onClick={() => setOpenCategoryId((current) => current === category.id ? null : category.id)} className={`whitespace-nowrap px-5 py-3 text-[15px] font-semibold transition-colors ${activeCategory === category.name ? 'border-b-2 border-red-main text-red-main' : 'text-[#1A1A1A] hover:text-red-main'}`}>
                    {category.name} <ChevronDown size={14} className={`inline-block transition-transform ${openCategoryId === category.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {openCategoryId === category.id && category.subcategories?.length > 0 && (
                    <div className="absolute left-0 top-full z-[9999] min-w-[220px] rounded-b-lg border-t-[3px] border-red-main bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.15)]" style={{ zIndex: 9999 }}>
                      {category.subcategories.map((subcategory) => <button key={subcategory.id} type="button" onClick={() => { navigate(`/categorie/${subcategory.slug}`); setOpenCategoryId(null) }} className="block w-full cursor-pointer px-6 py-3 text-left text-sm text-[#1A1A1A] transition-[padding,color,background-color] hover:bg-[#FFF0F0] hover:pl-7 hover:text-red-main">{subcategory.name}</button>)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && <motion.div className="fixed inset-0 z-[10000] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer les catégories" />
            <motion.aside className="absolute left-0 top-0 h-full w-[min(86vw,360px)] overflow-y-auto bg-white p-5 shadow-xl" initial={{ x: -30 }} animate={{ x: 0 }} exit={{ x: -30 }}>
              <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Catégories</h2><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer"><X size={20} /></button></div>
              {activeCategories.map((category) => <div key={category.id} className="border-b border-gray-border"><button type="button" onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)} className="flex w-full items-center justify-between py-3 text-left text-[15px] font-semibold">{category.name}<ChevronDown size={16} /></button>{openCategoryId === category.id && <div className="pb-2">{(category.subcategories || []).map((subcategory) => <button key={subcategory.id} type="button" onClick={() => { navigate(`/categorie/${subcategory.slug}`); setMobileMenuOpen(false); setOpenCategoryId(null) }} className="block w-full px-3 py-2 text-left text-sm text-gray-text hover:bg-[#FFF0F0] hover:text-red-main">{subcategory.name}</button>)}</div>}</div>)}
            </motion.aside>
          </motion.div>}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
