import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'
import { registerVendor } from '../../utils/api'

const initialFormValues = {
  firstName: '',
  lastName: '',
  password: '',
  email: '',
  phone: '',
  city: '',
  shopName: '',
  shopAddress: '',
  instagramLink: '',
  socialLink: '',
  acceptedTerms: false,
}

const inputClassName =
  'mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

const textareaClassName =
  'mt-1 w-full rounded-lg border border-gray-border bg-gray-bg px-3 py-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function SellerLogoLink() {
  return (
    <BrandLogo className="shrink-0" textClassName="brand-logo text-[28px] text-red-main" />
  )
}

function ProgressIndicator({ currentStep }) {
  const steps = [
    { number: 1, label: 'Identité' },
    { number: 2, label: 'Boutique' },
  ]

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number
        const isActive = currentStep === step.number

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                  isCompleted || isActive ? 'bg-red-main text-white' : 'bg-gray-bg text-gray-text'
                }`}
              >
                {isCompleted && !isActive ? <Check size={14} aria-hidden="true" /> : step.number}
              </span>
              <span
                className={`text-xs font-medium ${
                  isCompleted || isActive ? 'text-black-text' : 'text-gray-text'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-3 mb-5 h-px w-16 sm:w-20 ${
                  currentStep > step.number ? 'bg-red-main' : 'bg-gray-border'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SellerSignupPage() {
  const [formValues, setFormValues] = useState(initialFormValues)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [slideDirection, setSlideDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  function handleChange(event) {
    const { name, type, value, checked } = event.target
    const fieldValue = type === 'checkbox' ? checked : value

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: fieldValue,
    }))
  }

  function validateStep1() {
    const nextErrors = {}
    const email = formValues.email.trim()

    if (!formValues.firstName.trim()) {
      nextErrors.firstName = 'Ce champ est obligatoire.'
    }

    if (!formValues.lastName.trim()) {
      nextErrors.lastName = 'Ce champ est obligatoire.'
    }

    if (!email) {
      nextErrors.email = 'Ce champ est obligatoire.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Veuillez saisir une adresse email valide.'
    }

    if (!formValues.password.trim()) {
      nextErrors.password = 'Ce champ est obligatoire.'
    } else if (formValues.password.trim().length < 6) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = 'Ce champ est obligatoire.'
    }

    if (!formValues.city.trim()) {
      nextErrors.city = 'Ce champ est obligatoire.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateStep2() {
    const nextErrors = {}

    if (!formValues.shopName.trim()) {
      nextErrors.shopName = 'Ce champ est obligatoire.'
    }

    if (!formValues.shopAddress.trim()) {
      nextErrors.shopAddress = 'Ce champ est obligatoire.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function goToStep2() {
    setErrors({})
    setSlideDirection(1)
    setCurrentStep(2)
  }

  function handleStep1Submit(event) {
    event.preventDefault()

    if (!validateStep1()) {
      return
    }

    goToStep2()
  }

  async function handleStep2Submit(event) {
    event.preventDefault()

    if (!validateStep2()) {
      return
    }

    if (!formValues.acceptedTerms) {
      setErrors({ acceptedTerms: 'Vous devez accepter les conditions du vendeur pour poursuivre.' })
      return
    }

    const payload = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      email: formValues.email.trim(),
      password: formValues.password.trim(),
      phone: formValues.phone.trim(),
      shopName: formValues.shopName.trim(),
      city: formValues.city.trim(),
      shopAddress: formValues.shopAddress.trim(),
    }

    if (formValues.instagramLink.trim()) {
      payload.instagramLink = formValues.instagramLink.trim()
    }

    if (formValues.socialLink.trim()) {
      payload.socialLink = formValues.socialLink.trim()
    }

    setSubmitting(true)
    setErrors({})

    try {
      await registerVendor(payload)
      setIsSubmitted(true)
    } catch (error) {
      const apiError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Une erreur est survenue lors de l’envoi de votre demande.'

      if (error.response?.status === 409) {
        setErrors({ form: apiError })
      } else if (error.response?.status === 400) {
        setErrors({ form: apiError })
      } else {
        setErrors({ form: apiError })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleBackToStep1() {
    setErrors({})
    setSlideDirection(-1)
    setCurrentStep(1)
  }

  const stepVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 28 : -28,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -28 : 28,
    }),
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-off-white px-4 py-10 text-black-text">
      <div className="w-full max-w-[540px] rounded-2xl border border-gray-border bg-white px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:px-8 sm:py-10">
        <div className="flex justify-center">
          <SellerLogoLink />
        </div>

        {!isSubmitted && <div className="mt-8"><ProgressIndicator currentStep={currentStep} /></div>}

        <AnimatePresence mode="wait" custom={slideDirection}>
          {isSubmitted ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8 text-center"
            >
              <CheckCircle size={54} className="mx-auto text-red-main" aria-hidden="true" />
              <h1 className="mt-5 text-2xl font-bold text-black-text">Demande envoyée avec succès !</h1>
              <p className="mt-3 text-sm leading-7 text-gray-text">
                Dibladi vous remercie. Votre dossier est en cours d'examen. Vous recevrez une réponse sur votre espace dans un délai maximum de 48 heures.
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
              >
                Retour à l'accueil
              </Link>
            </motion.div>
          ) : currentStep === 1 ? (
            <motion.div
              key="step-1"
              custom={slideDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8"
            >
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-black-text">Inscription vendeur</h1>
                <p className="mt-2 text-sm text-gray-text">
                  Étape 1 sur 2 — Renseignez vos informations personnelles pour créer votre demande.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleStep1Submit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-black-text">Prénom</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-main">{errors.firstName}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-black-text">Nom</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-main">{errors.lastName}</p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Adresse email</span>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className={inputClassName}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-main">{errors.email}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Mot de passe</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formValues.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={`${inputClassName} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-text"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-main">{errors.password}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Numéro de téléphone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-main">{errors.phone}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Ville</span>
                  <input
                    type="text"
                    name="city"
                    value={formValues.city}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-main">{errors.city}</p>}
                </label>

                <button
                  type="submit"
                  className="mt-2 h-11 w-full rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
                >
                  Suivant
                </button>
              </form>
            </motion.div>
          ) : currentStep === 2 ? (
            <motion.div
              key="step-2"
              custom={slideDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-sm font-medium text-gray-text transition-colors duration-200 hover:text-black-text"
                >
                  Retour
                </button>
                <span className="text-sm font-medium text-gray-text">Étape 2 sur 2</span>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-black-text">Votre boutique</h1>
                <p className="mt-2 text-sm text-gray-text">
                  Complétez les informations de votre boutique.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleStep2Submit} noValidate>
                <label className="block">
                  <span className="text-sm font-medium text-black-text">Nom de la boutique</span>
                  <input
                    type="text"
                    name="shopName"
                    value={formValues.shopName}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                  {errors.shopName && (
                    <p className="mt-1 text-xs text-red-main">{errors.shopName}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">Adresse vendeur</span>
                  <textarea
                    name="shopAddress"
                    value={formValues.shopAddress}
                    onChange={handleChange}
                    rows={4}
                    className={textareaClassName}
                  />
                  {errors.shopAddress && (
                    <p className="mt-1 text-xs text-red-main">{errors.shopAddress}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">
                    Lien Instagram <span className="font-normal text-gray-text">(optionnel)</span>
                  </span>
                  <input
                    type="url"
                    name="instagramLink"
                    value={formValues.instagramLink}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-black-text">
                    Autre lien réseau social <span className="font-normal text-gray-text">(optionnel)</span>
                  </span>
                  <input
                    type="url"
                    name="socialLink"
                    value={formValues.socialLink}
                    onChange={handleChange}
                    placeholder="Facebook, TikTok, site web..."
                    className={inputClassName}
                  />
                </label>

                <div className="rounded-2xl border border-gray-border bg-gray-bg p-4">
                  <label className="flex flex-col gap-3 text-sm text-black-text">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        checked={formValues.acceptedTerms}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border border-gray-border bg-white text-red-main focus:ring-red-main"
                      />
                      <span>J'accepte les conditions générales</span>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-sm font-medium text-red-main underline underline-offset-2 transition-colors duration-200 hover:text-red-dark"
                      >
                        Voir les conditions générales
                      </button>
                    </div>
                    {errors.acceptedTerms && (
                      <p className="text-xs text-red-main">{errors.acceptedTerms}</p>
                    )}
                  </label>
                </div>

                {errors.form && <p className="text-sm text-red-main">{errors.form}</p>}

                <button
                  type="submit"
                  disabled={submitting || !formValues.acceptedTerms}
                  className="mt-2 h-11 w-full rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:bg-gray-300"
                >
                  {submitting ? 'Envoi en cours...' : 'Valider ma demande'}
                </button>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between border-b border-gray-border px-5 py-4">
                <h2 className="text-base font-semibold text-black-text">Conditions générales de vente et d'utilisation DiblaDi pour les vendeurs</h2>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-xl font-bold text-gray-text transition-colors duration-200 hover:text-black-text"
                  aria-label="Fermer les conditions"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto px-5 py-4 text-sm leading-7 text-black-text">
                <section>
  <h3 className="text-xl font-bold text-black">
    Conditions Générales pour les Vendeurs sur Dibladi
  </h3>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      100% Produit Marocain :
    </strong>{" "}
    Tous les produits proposés par le vendeur doivent être exclusivement fabriqués au Maroc par des artisans ou des marques marocaines (vérification obligatoire via Instagram, TikTok ou photos).
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Validation du Compte :
    </strong>{" "}
    Toute demande d'inscription et de création de boutique est soumise à validation par l'administration dans un délai de 48 heures.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Responsabilité, Qualité et Prix :
    </strong>{" "}
    Le vendeur garantit l'authenticité et la qualité irréprochable de ses produits. Il est seul responsable des articles mis en vente, de la fixation des prix, de la conformité des visuels et de la description exacte des produits par rapport à la réalité.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Gestion des Stocks :
    </strong>{" "}
    Le vendeur s'engage à maintenir ses stocks à jour sur son interface. Si un produit n'est plus disponible, il doit immédiatement cocher la case "Rupture de stock" pour éviter toute commande erronée.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Commission de la Plateforme :
    </strong>{" "}
    Dibladi prélève une commission de 5% sur chaque commande confirmée et livrée.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Modalités de Paiement :
    </strong>{" "}
    Les gains des ventes (après déduction de la commission de 5%) sont versés au vendeur par virement bancaire lors de chaque versement groupé de la société de livraison (virements traités du lundi au vendredi).
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Processus de Livraison :
    </strong>{" "}
    Le vendeur n'a pas de contact direct avec le service de livraison (géré entièrement par l'équipe Dibladi). Le livreur contactera directement le vendeur par téléphone pour récupérer le colis à son adresse. Le vendeur doit veiller à l'exactitude de ses coordonnées et à la disponibilité du produit.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      Système de Score :
    </strong>{" "}
    Un système de notation interne évalue l'activité du vendeur (nombre de ventes réussies, réactivité, respect des stocks). Les meilleures notes permettent une mise en avant des produits sur la page d'accueil de la plateforme.
  </p>
</section>

                <section dir="rtl">
  <h3 className="text-xl font-bold text-black">
    الشروط الخاصة بالبائعين على منصة "Dibladi" (مساحة البائع)
  </h3>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      منتوج مغربي 100%:
    </strong>{" "}
    يجب أن تكون جميع المنتجات المعروضة مصنوعة حصرياً في المغرب بأيدي مغربية (يتم التحقق منها عبر إنستغرام، تيك توك أو الصور).
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      الموافقة على الحساب:
    </strong>{" "}
    تخضع كل طلبات التسجيل وإنشاء المتاجر للمراجعة والقبول من طرف الإدارة في غضون 48 ساعة.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      المسؤولية، الجودة والتسعير:
    </strong>{" "}
    يضمن البائع أصلية وجودة منتجاته، ويتحمل المسؤولية الكاملة عن السلع المعروضة، وتحديد الأسعار، ومطابقة الصور والوصف للواقع تماماً.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      إدارة المخزون:
    </strong>{" "}
    يلتزم البائع بتحديث حالة الستوك بانتظام على واجهته؛ وفي حال نفاد المنتوج، يجب تسجيل ذلك فوراً (اختيار خانة "نفاد المخزون") لتفادي الطلبيات الخاطئة.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      عمولة المنصة:
    </strong>{" "}
    تقتطع منصة "Dibladi" عمولة بنسبة 5% على كل طلبية مؤكدة ومسلمة للزبون.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      طريقة وأوقات الأداء:
    </strong>{" "}
    يتم تحويل مستحقات المبيعات للبائع (بعد اقتطاع عمولة 5%) مع كل دفعة مالية تتوصل بها المنصة من شركة التوصيل (التحويلات البنكية تجرى من الاثنين إلى الجمعة).
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      نظام التوصيل:
    </strong>{" "}
    لا يتعامل البائع بشكل مباشر مع شركة التوصيل، بل تتكفل إدارة "Dibladi" بالتنسيق الكامل. سيتصل موظف التوصيل بالبائع هاتفيّاً لاستلام الطرد من عنوانه، لذا يجب التأكد من صحة العنوان ورقم الهاتف وجهوزية المنتوج.
  </p>

  <p className="mt-4 leading-7 text-black-text">
    <strong className="text-lg font-bold text-black">
      نظام النقاط (السكور):
    </strong>{" "}
    يعتمد الموقع نظام تقييم لقياس أداء البائعين (بناءً على المبيعات والالتزام). البائعون الحاصلون على أعلى النقاط سيتم عرض منتجاتهم في واجهة الصفحة الرئيسية تشجيعاً لهم.
  </p>
</section>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default SellerSignupPage
