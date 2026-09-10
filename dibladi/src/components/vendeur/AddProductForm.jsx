import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, UploadCloud, X } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import {
  fetchCategoryAttributes,
  fetchParentCategories,
  fetchCurrentVendorProfile,
  uploadProductImage,
} from '../../utils/api'

const STEPS = ['Photos', 'Catégorie', 'Variantes', 'Informations']
const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']
const GENRES = ['Femme', 'Homme', 'Enfant', 'Unisexe']
const UNITS = ['ml', 'g', 'Gélules', 'Comprimés', 'Gummies']
const inputClass = 'mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none focus:border-red-main'
const buttonClass = 'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

function makeCombinationValues(attributes, options) {
  return attributes.reduce((values, attribute) => {
    const selected = options[attribute.attributeKey] || []
    return values.flatMap((value) => selected.map((item) => (value ? `${value}|${item}` : item)))
  }, [''])
}

function parseCombination(label) {
  if (!label) return {}
  try {
    return JSON.parse(label) || {}
  } catch {
    return {}
  }
}

function stringifyCombinationValue(values) {
  if (!values || typeof values !== 'object') {
    return ''
  }

  return Object.values(values)
    .filter((value) => value !== undefined && value !== null && value !== '')
    .join(' + ')
}

function normalizeVariantForForm(variant) {
  if (!variant) {
    return null
  }

  return {
    ...variant,
    id: variant.id ?? `variant-${Math.random()}`,
    price: variant.price ?? '',
    stockQuantity: Number(variant.stockQuantity ?? 0),
  }
}

function AddProductForm({ initialProduct = null, initialVariants = [], mode = 'add', onSuccess }) {
  const { currentUser } = useAuth()
  const [step, setStep] = useState(1)
  const [variantSubstep, setVariantSubstep] = useState('options')
  const [parents, setParents] = useState([])
  const [selectedParentId, setSelectedParentId] = useState('')
  const [subcategories, setSubcategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [attributes, setAttributes] = useState([])
  const [options, setOptions] = useState({})
  const [newOption, setNewOption] = useState({})
  const [images, setImages] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', stockQuantity: '' })
  const [variants, setVariants] = useState([])
  const [simpleProduct, setSimpleProduct] = useState(false)
  const [loading, setLoading] = useState(mode === 'edit')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profileShopName, setProfileShopName] = useState('')
  const inputRef = useRef(null)

  const selectedParent = parents.find((parent) => String(parent.id) === String(selectedParentId))
  const selectedCategory = subcategories.find((category) => String(category.id) === String(selectedCategoryId))
  const parentName = selectedParent?.name || initialProduct?.parentCategoryName || ''
  const categoryName = selectedCategory?.name || initialProduct?.subcategoryName || initialProduct?.categoryName || ''
  const shopName = currentUser?.shopName || currentUser?.sellerShopName || profileShopName || 'Votre boutique'

  useEffect(() => {
    fetchParentCategories()
      .then(setParents)
      .catch(() => setError('Impossible de charger les catégories.'))
  }, [])

  useEffect(() => {
    if (currentUser?.shopName || currentUser?.sellerShopName) return
    fetchCurrentVendorProfile()
      .then(({ data }) => setProfileShopName(data?.shopName || ''))
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    if (!initialProduct) return
    setForm({
      name: initialProduct.name || '',
      description: initialProduct.description || '',
      price: initialProduct.price || '',
      stockQuantity: initialProduct.stockQuantity ?? '',
    })
    setImages((initialProduct.images || []).map((url) => ({ id: url, url, preview: url })))
    setSelectedCategoryId(initialProduct.categoryId || initialProduct.subcategoryId || '')
    setSelectedParentId(initialProduct.parentCategoryId || '')
    setVariants((initialVariants || []).map((variant) => normalizeVariantForForm(variant)))
    setSimpleProduct(!(initialVariants || []).length)
    setLoading(false)
  }, [initialProduct, initialVariants])

  useEffect(() => {
    if (!selectedParent) {
      setSubcategories([])
      return
    }
    setSubcategories(selectedParent.subcategories || [])
  }, [selectedParent])

  useEffect(() => {
    if (!selectedCategoryId) {
      setAttributes([])
      return
    }
    fetchCategoryAttributes(selectedCategoryId)
      .then((data) => {
        setAttributes(data)
        setOptions((current) => {
          const existingValues = (initialVariants || []).reduce((result, variant) => {
            data.forEach((attribute) => {
              const value = combination[attribute.attributeKey]
              if (value && !result[attribute.attributeKey]?.includes(value)) {
                result[attribute.attributeKey] = [...(result[attribute.attributeKey] || []), value]
              }
            })
            return result
          }, {})

          return Object.fromEntries(data.map((attribute) => [
            attribute.attributeKey,
            existingValues[attribute.attributeKey] || current[attribute.attributeKey] || [],
          ]))
        })
      })
      .catch(() => setError('Impossible de charger les attributs de la sous-catégorie.'))
  }, [selectedCategoryId])

  const technicalOptions = useMemo(() => Object.entries(options).filter(([, values]) => values.length).map(([key, values]) => `${key}: ${values.join(', ')}`), [options])

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, 8 - images.length)
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = []
      for (const file of files) {
        const data = new FormData()
        data.append('file', file)
        const response = await uploadProductImage(data)
        if (response.data?.url) uploaded.push({ id: `${file.name}-${file.lastModified}`, url: response.data.url, preview: URL.createObjectURL(file) })
      }
      setImages((current) => [...current, ...uploaded])
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.response?.data?.error || 'Impossible de téléverser la photo.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function removeImage(id) {
    setImages((current) => current.filter((image) => image.id !== id))
  }

  function selectParent(event) {
    setSelectedParentId(event.target.value)
    setSelectedCategoryId('')
    setAttributes([])
    setOptions({})
    setVariants([])
  }

  function selectCategory(event) {
    setSelectedCategoryId(event.target.value)
    setVariants([])
  }

  function addTextOption(attributeKey) {
    const value = (newOption[attributeKey] || '').trim()
    if (!value) return
    setOptions((current) => ({ ...current, [attributeKey]: [...new Set([...(current[attributeKey] || []), value])] }))
    setNewOption((current) => ({ ...current, [attributeKey]: '' }))
  }

  function toggleOption(key, value, multiple) {
    setOptions((current) => {
      const values = current[key] || []
      return { ...current, [key]: multiple ? (values.includes(value) ? values.filter((item) => item !== value) : [...values, value]) : [value] }
    })
  }

  function generateVariants() {
    const combinations = makeCombinationValues(attributes, options)
    if (!combinations.length || combinations.some((value) => !value)) {
      setError('Sélectionnez au moins une valeur pour chaque attribut.')
      return
    }
    setError('')

    const existingByCombination = new Map(
      (initialVariants || []).map((variant) => {
        const trimmed = parseCombination(variant?.combinationLabel)
        const normalizedKey = JSON.stringify(trimmed)
        return [normalizedKey, variant]
      })
    )

    setVariants(combinations.map((label, index) => {
      const selectedValues = label.split('|')
      const values = attributes.reduce((result, attribute, attribIndex) => ({
        ...result,
        [attribute.attributeKey]: selectedValues[attribIndex],
      }), {})
      const serialized = JSON.stringify(values)
      const existingVariant = existingByCombination.get(serialized)

      return {
        id: existingVariant?.id ?? `new-${index}`,
        combinationLabel: serialized,
        price: existingVariant?.price ?? '',
        stockQuantity: Number(existingVariant?.stockQuantity ?? 0),
      }
    }))
  }

  function updateVariant(id, field, value) {
    setVariants((current) => current.map((variant) => {
      if (variant.id !== id) return variant
      const next = { ...variant, [field]: value }
      return next
    }))
  }

  function validateStep() {
    if (step === 1) return images.length > 0
    if (step === 2) return Boolean(selectedParentId && selectedCategoryId)
    if (step === 3 && variantSubstep === 'options') return true
    if (step === 3) return simpleProduct ? Number(form.price) > 0 : variants.length > 0 && variants.every((variant) => Number(variant.price) > 0)
    return Boolean(form.name.trim() && form.description.trim().length >= 20)
  }

  async function publish(event) {
    event.preventDefault()
    if (!validateStep()) {
      setError(step === 4 ? 'Le nom et une description de 20 caractères minimum sont obligatoires.' : 'Complétez les champs obligatoires avant de continuer.')
      return
    }
    if (step === 3 && variantSubstep === 'options') {
      const hasOptions = Object.values(options).some((values) => values.length > 0)
      if (hasOptions) {
        generateVariants()
        setSimpleProduct(false)
      } else {
        setVariants([])
        setSimpleProduct(true)
      }
      setVariantSubstep('prices')
      setError('')
      return
    }
    if (step < 4) {
      setError('')
      setStep((current) => current + 1)
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: Number(selectedCategoryId),
        images: images.map((image) => image.url),
        price: Number(simpleProduct ? form.price : variants.find((variant) => Number(variant.price) > 0)?.price || form.price || 0),
        stockQuantity: Number(simpleProduct ? form.stockQuantity || 0 : variants.reduce((total, variant) => total + Number(variant.stockQuantity || 0), 0)),
        variants: simpleProduct
          ? [{ combinationLabel: JSON.stringify({ type: 'simple' }), price: Number(form.price), stockQuantity: Number(form.stockQuantity || 0), isAvailable: Number(form.stockQuantity || 0) > 0 }]
          : variants.map((variant) => ({
              ...variant,
              price: Number(variant.price),
              stockQuantity: Number(variant.stockQuantity || 0),
            })),
      }
      await onSuccess(payload, variants)
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.response?.data?.error || 'Erreur lors de la publication')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="py-10 text-center text-sm text-gray-text">Chargement du produit...</p>

  return (
    <form onSubmit={publish} className="mx-auto max-w-[800px] space-y-6" noValidate>
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((label, index) => {
          const number = index + 1
          return <div key={label} className={`border-t-4 pt-2 text-center text-xs font-semibold ${number <= step ? 'border-red-main text-red-main' : 'border-gray-border text-gray-text'}`}><span>{number}. {label}</span></div>
        })}
      </div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-main">{error}</p>}

      {step === 1 && <section className="space-y-4">
        <div className="cursor-pointer rounded-xl border-2 border-dashed border-red-main bg-red-50/30 p-10 text-center" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="mx-auto text-red-main" size={34} aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold">Cliquez ou glissez vos photos ici</p>
          <p className="mt-1 text-xs text-gray-text">Minimum 1 photo, maximum 8 photos</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>
        {uploading && <p className="text-sm text-gray-text">Téléversement en cours...</p>}
        <div className="flex flex-wrap gap-3">{images.map((image) => <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-border"><img src={image.preview} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-main" aria-label="Supprimer la photo"><X size={13} /></button></div>)}</div>
      </section>}

      {step === 2 && <section className="space-y-4">
        <label className="block text-sm font-medium">Grande catégorie *<select value={selectedParentId} onChange={selectParent} className={inputClass}><option value="">Sélectionner...</option>{parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}</select></label>
        <label className="block text-sm font-medium">Sous-catégorie *<select value={selectedCategoryId} onChange={selectCategory} disabled={!selectedParentId} className={inputClass}><option value="">Sélectionner...</option>{subcategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      </section>}

      {step === 3 && <section className="space-y-5">
        {variantSubstep === 'options' ? <div className="space-y-4 rounded-xl border border-gray-border p-4"><h2 className="font-semibold">Ajouter des options</h2>{attributes.map((attribute) => { const values = options[attribute.attributeKey] || []; const choices = attribute.attributeKey === 'taille' ? SIZES : attribute.attributeKey === 'genre' ? GENRES : attribute.attributeKey === 'unite' ? UNITS : null; return <div key={attribute.id}><p className="text-sm font-medium">{attribute.attributeLabel} {attribute.isRequired && '*'}</p>{attribute.attributeType === 'text' ? <div className="flex gap-2"><input value={newOption[attribute.attributeKey] || ''} placeholder={attribute.placeholderHint || ''} onChange={(event) => setNewOption((current) => ({ ...current, [attribute.attributeKey]: event.target.value }))} className={inputClass} /><button type="button" onClick={() => addTextOption(attribute.attributeKey)} className={`${buttonClass} mt-1 shrink-0 bg-red-main text-white`}><Plus size={15} /></button></div> : attribute.attributeType === 'number' ? <input type="number" placeholder={attribute.placeholderHint || ''} value={values[0] || ''} onChange={(event) => setOptions((current) => ({ ...current, [attribute.attributeKey]: [event.target.value] }))} className={inputClass} /> : <div className="mt-2 flex flex-wrap gap-2">{(choices || []).map((choice) => <button type="button" key={choice} onClick={() => toggleOption(attribute.attributeKey, choice, attribute.attributeKey === 'taille')} className={`${buttonClass} border ${values.includes(choice) ? 'border-red-main bg-red-main text-white' : 'border-red-main bg-white text-red-main'}`}>{choice}</button>)}</div>}{values.length > 0 && attribute.attributeType === 'text' && <div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs text-red-main">{value}<button type="button" onClick={() => setOptions((current) => ({ ...current, [attribute.attributeKey]: values.filter((item) => item !== value) }))} aria-label={`Supprimer ${value}`}><X size={12} /></button></span>)}</div>}</div>})}</div> : simpleProduct ? <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Prix du produit *<input name="price" type="number" min="0" value={form.price} onChange={updateForm} className={inputClass} /></label><label className="text-sm font-medium">Stock disponible *<input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={updateForm} className={inputClass} /></label></div> : <div className="overflow-x-auto rounded-xl border border-gray-border"><h2 className="p-4 font-semibold">Définissez le prix et le stock pour chaque combinaison</h2><table className="w-full text-left text-sm"><thead className="bg-gray-bg"><tr><th className="p-3">Combinaison</th><th className="p-3">Prix (MAD)</th><th className="p-3">Stock</th><th className="p-3">Disponible</th></tr></thead><tbody>{variants.map((variant) => <tr key={variant.id} className="border-t"><td className="p-3">{Object.values(JSON.parse(variant.combinationLabel)).join(' + ')}</td><td className="p-3"><input type="number" min="0" value={variant.price} onChange={(event) => updateVariant(variant.id, 'price', event.target.value)} className="h-9 w-28 rounded border border-gray-border px-2" /></td><td className="p-3"><input type="number" min="0" value={variant.stockQuantity} onChange={(event) => updateVariant(variant.id, 'stockQuantity', event.target.value)} className="h-9 w-20 rounded border border-gray-border px-2" /></td><td className="p-3"><span className={`text-xs font-medium ${Number(variant.stockQuantity) > 0 ? 'text-green-700' : 'text-gray-text'}`}>{Number(variant.stockQuantity) > 0 ? 'Disponible' : 'Indisponible'}</span></td></tr>)}</tbody></table></div>}
      </section>}

      {step === 4 && <section className="space-y-4"><label className="block text-sm font-medium">Nom du produit *<input name="name" value={form.name} onChange={updateForm} className={inputClass} /></label><label className="block text-sm font-medium">Description *<textarea name="description" minLength="20" rows="6" value={form.description} onChange={updateForm} className="mt-1 w-full rounded-lg border border-gray-border bg-gray-bg px-3 py-3 text-sm outline-none focus:border-red-main" /></label><div className="rounded-xl border border-gray-border bg-gray-bg p-4 text-sm"><h2 className="font-semibold">Fiche Technique</h2><dl className="mt-3 space-y-2"><div className="flex justify-between gap-4"><dt>Catégorie</dt><dd className="font-medium">{parentName}</dd></div><div className="flex justify-between gap-4"><dt>Sous-catégorie</dt><dd className="font-medium">{categoryName}</dd></div><div className="flex justify-between gap-4"><dt>Vendu par</dt><dd className="font-medium">{shopName}</dd></div>{technicalOptions.map((line) => <div key={line} className="flex justify-between gap-4"><dt>{line.split(':')[0]}</dt><dd className="font-medium">{line.split(':').slice(1).join(':')}</dd></div>)}</dl></div></section>}

      <div className="flex justify-between gap-3"><button type="button" disabled={step === 1 || saving} onClick={() => { if (step === 3 && variantSubstep === 'prices') { setVariantSubstep('options'); return } setStep((current) => current - 1) }} className={`${buttonClass} border border-gray-border text-black-text`}>Précédent</button><button type="submit" disabled={saving || uploading || !validateStep()} className={`${buttonClass} ml-auto bg-red-main text-white`}>{step === 4 ? (saving ? 'Publication...' : mode === 'edit' ? 'Enregistrer les modifications' : 'Publier le produit') : 'Suivant'}</button></div>
    </form>
  )
}

export default AddProductForm
