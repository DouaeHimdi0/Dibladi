import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Plus, UploadCloud } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'
import SellerOrdersSection from '../../components/vendeur/SellerOrdersSection'
import SellerProductCard from '../../components/vendeur/SellerProductCard'
import useAuth from '../../hooks/useAuth'
import api, { deleteProduct, fetchCurrentVendorProfile, updateCurrentVendorProfile, uploadVendorPhoto } from '../../utils/api'

const SETTINGS_SECTIONS = [
  { id: 'informations-personnelles', label: 'Informations personnelles' },
  { id: 'conditions-travail', label: 'Conditions de travail' },
  { id: 'mes-produits', label: 'Mes produits' },
  { id: 'mes-commandes', label: 'Mes commandes' },
  { id: 'livraisons', label: 'Livraisons' },
]

const DEFAULT_SECTION = 'informations-personnelles'

function SellerSettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, logout } = useAuth()
  const [sellerProducts, setSellerProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [vendorProfile, setVendorProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoMessage, setPhotoMessage] = useState('')
  const [activeSection, setActiveSection] = useState(() => {
    const sectionFromUrl = searchParams.get('section')
    const isValid = SETTINGS_SECTIONS.some((section) => section.id === sectionFromUrl)
    return isValid ? sectionFromUrl : DEFAULT_SECTION
  })

  async function loadProducts() {
    setLoadingProducts(true)
    setProductsError('')

    try {
      const { data } = await api.get('/api/products/vendor/me')
      setSellerProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      setSellerProducts([])
      setProductsError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de charger vos produits.',
      )
    } finally {
      setLoadingProducts(false)
    }
  }

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    shopName: '',
    city: '',
    shopAddress: '',
    socialLink: '',
    bankAccountHolderName: '',
    bankName: '',
    bankRib: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('')

  function handleProfileChange(event) {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  function validateBankFields() {
    const holder = profileForm.bankAccountHolderName?.trim() || ''
    const bankName = profileForm.bankName?.trim() || ''
    const rib = profileForm.bankRib?.replace(/\s+/g, '') || ''

    if (!holder && !bankName && !rib) {
      return true
    }

    if (!holder || !bankName || !/^\d{24}$/.test(rib)) {
      return 'Pour enregistrer des coordonnées bancaires, renseignez le titulaire, le nom de la banque et un RIB valide à 24 chiffres.'
    }

    return true
  }

  async function loadVendorProfile() {
    setProfileLoading(true)
    setProfileError('')

    try {
      const { data } = await fetchCurrentVendorProfile()
      setVendorProfile(data)
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          shopName: data.shopName || '',
          city: data.city || '',
          shopAddress: data.shopAddress || '',
          socialLink: data.socialLink || '',
          bankAccountHolderName: data.bankAccountHolderName || '',
          bankName: data.bankName || '',
          bankRib: data.bankRib || '',
        })
      }
    } catch (error) {
      setVendorProfile(null)
      setProfileError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de charger votre profil vendeur.',
      )
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setSaveSuccessMessage('')
    setProfileError('')

    const bankValidation = validateBankFields()
    if (bankValidation !== true) {
      setProfileError(bankValidation)
      setSavingProfile(false)
      return
    }

    try {
      const payload = {
        ...profileForm,
        bankRib: profileForm.bankRib?.replace(/\s+/g, '') || '',
      }
      const { data } = await updateCurrentVendorProfile(payload)
      setVendorProfile(data)
      setSaveSuccessMessage('Profil mis à jour avec succès.')
    } catch (error) {
      setProfileError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de mettre à jour le profil.',
      )
    } finally {
      setSavingProfile(false)
    }
  }


  useEffect(() => {
    const sectionFromUrl = searchParams.get('section')
    const isValidSection = SETTINGS_SECTIONS.some((section) => section.id === sectionFromUrl)

    if (isValidSection && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl)
    }
  }, [activeSection, searchParams])

  useEffect(() => {
    loadProducts()
    loadVendorProfile()
  }, [])

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm('Supprimer ce produit ? Cette action est définitive.')

    if (!confirmed) {
      return
    }

    try {
      await deleteProduct(productId)
      await loadProducts()
    } catch (error) {
      setProductsError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de supprimer ce produit.',
      )
    }
  }

  function handleSectionChange(sectionId) {
    setActiveSection(sectionId)
    setSearchParams({ section: sectionId }, { replace: true })
  }

  async function handleVendorPhotoUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploadingPhoto(true)
    setPhotoMessage('')

    try {
      const { data } = await uploadVendorPhoto(formData)
      const photoUrl = data.url

      await updateCurrentVendorProfile({ photoUrl })
      setVendorProfile((currentProfile) => ({ ...currentProfile, photoUrl }))
      setPhotoMessage('Photo de boutique mise à jour.')
    } catch (error) {
      setPhotoMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Impossible de mettre à jour votre photo de boutique.',
      )
    } finally {
      setUploadingPhoto(false)
      event.target.value = ''
    }
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  function renderSectionContent() {
    switch (activeSection) {
      case 'informations-personnelles':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-border bg-gray-bg p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-text">Photo de boutique</p>
                  <p className="mt-1 text-sm text-gray-text">
                    Téléchargez une image pour mettre à jour votre logo ou photo de profil boutique.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark">
                  <UploadCloud size={16} aria-hidden="true" />
                  <span>{uploadingPhoto ? 'Envoi...' : 'Changer la photo'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleVendorPhotoUpload} />
                </label>
              </div>

              {photoMessage && (
                <p className={`mt-3 text-sm ${photoMessage.includes('Impossible') ? 'text-red-main' : 'text-green-600'}`}>
                  {photoMessage}
                </p>
              )}

              {vendorProfile?.photoUrl && (
                <div className="mt-4">
                  <img
                    src={vendorProfile.photoUrl}
                    alt="Photo de boutique"
                    className="h-28 w-28 rounded-xl border border-gray-border object-cover"
                  />
                </div>
              )}
            </div>

            {profileLoading && <p className="text-sm text-gray-text">Chargement de votre profil...</p>}
            {!profileLoading && profileError && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">{profileError}</p>
            )}
            {saveSuccessMessage && (
              <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 font-medium">{saveSuccessMessage}</p>
            )}

            {!profileLoading && vendorProfile && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Nom de la boutique</label>
                    <input
                      type="text"
                      value={profileForm.shopName}
                      onChange={(e) => setProfileForm(p => ({ ...p, shopName: e.target.value }))}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Ville</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Lien réseau social / Instagram</label>
                    <input
                      type="text"
                      value={profileForm.socialLink}
                      onChange={(e) => setProfileForm(p => ({ ...p, socialLink: e.target.value }))}
                      className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black-text mb-1">Adresse de la boutique</label>
                  <textarea
                    rows={3}
                    value={profileForm.shopAddress}
                    onChange={(e) => setProfileForm(p => ({ ...p, shopAddress: e.target.value }))}
                    className="w-full rounded-lg border border-gray-border bg-white p-3 text-sm font-medium text-black-text outline-none focus:border-red-main"
                  />
                </div>

                <div className="mt-8 border-t border-gray-border pt-6">
                  <h4 className="mb-4 text-sm font-semibold text-black-text">Coordonnées bancaires</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-text">Nom et prénom du titulaire</span>
                      <input
                        type="text"
                        name="bankAccountHolderName"
                        value={profileForm.bankAccountHolderName}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-text">Nom de la banque</span>
                      <input
                        type="text"
                        name="bankName"
                        value={profileForm.bankName}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-sm font-medium text-gray-text">RIB (24 chiffres)</span>
                      <input
                        type="text"
                        name="bankRib"
                        value={profileForm.bankRib}
                        onChange={(e) => setProfileForm((p) => ({ ...p, bankRib: e.target.value.replace(/\D/g, '').slice(0, 24) }))}
                        maxLength={24}
                        className="w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm font-medium text-black-text outline-none focus:border-red-main"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-red-main px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-dark disabled:opacity-50"
                  >
                    {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )


      case 'conditions-travail':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-border bg-gray-bg p-5">
              <h2 className="text-base font-semibold text-gray-text">Conditions Générales pour les Vendeurs sur Dibladi</h2>
              <p className="mt-4 text-sm leading-7 text-black-text">
                100% Produit Marocain : Tous les produits proposés par le vendeur doivent être exclusivement fabriqués au Maroc par des artisans ou des marques marocaines (vérification obligatoire via Instagram, TikTok ou photos).
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Validation du Compte : Toute demande d'inscription et de création de boutique est soumise à validation par l'administration dans un délai de 48 heures.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Responsabilité, Qualité et Prix : Le vendeur garantit l'authenticité et la qualité irréprochable de ses produits. Il est seul responsable des articles mis en vente, de la fixation des prix, de la conformité des visuels et de la description exacte des produits par rapport à la réalité.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Gestion des Stocks : Le vendeur s'engage à maintenir ses stocks à jour sur son interface. Si un produit n'est plus disponible, il doit immédiatement cocher la case "Rupture de stock" pour éviter toute commande erronée.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Commission de la Plateforme : Dibladi prélève une commission de 5% sur chaque commande confirmée et livrée.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Modalités de Paiement : Les gains des ventes (après déduction de la commission de 5%) sont versés au vendeur par virement bancaire lors de chaque versement groupé de la société de livraison (virements traités du lundi au vendredi).
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Processus de Livraison : Le vendeur n'a pas de contact direct avec le service de livraison (géré entièrement par l'équipe Dibladi). Le livreur contactera directement le vendeur par téléphone pour récupérer le colis à son adresse. Le vendeur doit veiller à l'exactitude de ses coordonnées et à la disponibilité du produit.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                Système de Score : Un système de notation interne évalue l'activité du vendeur (nombre de ventes réussies, réactivité, respect des stocks). Les meilleures notes permettent une mise en avant des produits sur la page d'accueil de la plateforme.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-border bg-gray-bg p-5">
              <h3 className="text-sm font-semibold text-gray-text">الشروط الخاصة بالبائعين على منصة "Dibladi" (مساحة البائع)</h3>
              <p className="mt-4 text-sm leading-7 text-black-text">
                منتوج مغربي 100%: يجب أن تكون جميع المنتجات المعروضة مصنوعة حصرياً في المغرب بأيدي مغربية (يتم التحقق منها عبر إنستغرام، تيك توك أو الصور).
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                الموافقة على الحساب: تخضع كل طلبات التسجيل وإنشاء المتاجر للمراجعة والقبول من طرف الإدارة في غضون 48 ساعة.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                المسؤولية، الجودة والتسعير: يضمن البائع أصلية وجودة منتجاته، ويتحمل المسؤولية الكاملة عن السلع المعروضة، وتحديد الأسعار، ومطابقة الصور والوصف للواقع تماماً.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                إدارة المخزون: يلتزم البائع بتحديث حالة الستوك بانتظام على واجهته؛ وفي حال نفاد المنتوج، يجب تسجيل ذلك فوراً (اختيار خانة "نفاد المخزون") لتفادي الطلبيات الخاطئة.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                عمولة المنصة: تقتطع منصة  "Dibladi" عمولة بنسبة 5% على كل طلبية مؤكدة ومسلمة للزبون.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                طريقة وأوقات الأداء: يتم تحويل مستحقات المبيعات للبائع (بعد اقتطاع عمولة 5%) مع كل دفعة مالية تتتوصل بها المنصة من شركة التوصيل (التحويلات البنكية تجرى من الاثنين إلى الجمعة).
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                نظام التوصيل: لا يتعامل البائع بشكل مباشر مع شركة التوصيل، بل تتكفل إدارة "Dibladi " بالتنسيق الكامل. سيتصل موظف التوصيل بالبائع هاتفيّاً لاستلام الطرد من عنوانه، لذا يجب التأكد من صحة العنوان ورقم الهاتف وجهوزية المنتوج.
              </p>
              <p className="mt-3 text-sm leading-7 text-black-text">
                نظام النقاط (السكور): يعتمد الموقع نظام تقييم لقياس أداء البائعين (بناءً على المبيعات والالتزام). البائعون الحاصلون على أعلى النقاط سيتم عرض منتجاتهم في واجهة الصفحة الرئيسية تشجيعاً لهم.
              </p>
            </div>
          </div>
        )

      case 'mes-produits':
        return (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-text">{sellerProducts.length} produit(s) publié(s)</p>
              <button
                type="button"
                onClick={() => navigate('/vendeur/produits/ajouter')}
                className="inline-flex items-center gap-2 rounded-lg bg-red-main px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
              >
                <Plus size={16} aria-hidden="true" />
                Ajouter un produit
              </button>
            </div>

            {loadingProducts && <p className="mb-4 text-sm text-gray-text">Chargement de vos produits...</p>}
            {!loadingProducts && productsError && (
              <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">
                {productsError}
              </p>
            )}

            {!loadingProducts && sellerProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-border bg-white px-6 py-14 text-center">
                <p className="text-sm text-gray-text">Vous n&apos;avez pas encore de produit publié.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sellerProducts.map((product) => (
                  <SellerProductCard
                    key={product.id}
                    product={product}
                    onEdit={(productId) => navigate(`/vendeur/produits/modifier/${productId}`)}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'mes-commandes':
        return <SellerOrdersSection />

      case 'livraisons':
        return (
          <div>
            <div className="mb-5 rounded-2xl border border-gray-border bg-gray-50 px-5 py-4">
              <p className="text-sm font-medium text-black-text">Statut des livraisons</p>
              <p className="mt-2 text-sm text-gray-text">
                Vous pouvez consulter ici vos commandes et leur statut de livraison. Seul l'administrateur peut modifier le statut.
              </p>
            </div>
            <SellerOrdersSection />
          </div>
        )

      default:
        return null
    }
  }

  const activeSectionLabel =
    SETTINGS_SECTIONS.find((section) => section.id === activeSection)?.label ?? 'Paramètres'

  return (
    <main className="min-h-screen bg-off-white text-black-text">
      <header className="border-b border-gray-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo className="shrink-0" textClassName="brand-logo text-[24px] text-red-main" />
            <span className="text-[18px] font-bold leading-none text-black-text">Espace vendeur</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vendeur/dashboard"
              className="hidden text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main sm:inline"
            >
              Dashboard
            </Link>
            <Link
              to="/"
              className="hidden text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main md:inline"
            >
              Retour à la boutique
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-text transition-colors duration-200 hover:text-red-main"
            >
              <LogOut size={16} aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-black-text">Paramètres</h1>

        <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <nav className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {SETTINGS_SECTIONS.map((section) => {
                const isActive = activeSection === section.id

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
                    className={`shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors duration-200 lg:w-full ${
                      isActive
                        ? 'bg-red-main text-white'
                        : 'border border-gray-border bg-white text-gray-text hover:text-black-text lg:border-0 lg:bg-transparent lg:hover:bg-gray-bg'
                    }`}
                  >
                    {section.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <motion.section
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-gray-border bg-white p-5 sm:p-6 lg:mt-0"
          >
            <h2 className="mb-5 text-lg font-bold text-black-text">{activeSectionLabel}</h2>
            {renderSectionContent()}
          </motion.section>
        </div>
      </div>
    </main>
  )
}

export default SellerSettingsPage
