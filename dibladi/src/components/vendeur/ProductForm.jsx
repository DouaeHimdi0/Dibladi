import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '../../utils/sellerHelpers'

const inputClassName =
  'mt-1 h-11 w-full rounded-lg border border-gray-border bg-gray-bg px-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

const textareaClassName =
  'mt-1 w-full rounded-lg border border-gray-border bg-gray-bg px-3 py-3 text-sm text-black-text outline-none transition-colors duration-200 focus:border-red-main'

const initialFormState = {
  name: '',
  price: '',
  description: '',
  stockStatus: 'in',
  category: '',
}

function buildInitialImages(initialProduct) {
  if (!initialProduct) {
    return []
  }

  const sources = initialProduct.images?.length
    ? initialProduct.images
    : initialProduct.image
      ? [initialProduct.image]
      : []

  return sources.map((url) => ({
    id: url,
    preview: url,
    isExisting: true,
  }))
}

function ProductForm({ mode = 'add', initialProduct, onSubmit, onDelete }) {
  const [formValues, setFormValues] = useState(() => {
    if (!initialProduct) {
      return initialFormState
    }

    return {
      name: initialProduct.name ?? '',
      price: String(initialProduct.price ?? ''),
      description: initialProduct.description ?? '',
      stockStatus: initialProduct.stockQuantity > 0 ? 'in' : 'out',
      category: initialProduct.categoryLabel ?? initialProduct.category ?? '',
    }
  })
  const [images, setImages] = useState(() => buildInitialImages(initialProduct))
  const [errors, setErrors] = useState({})
  const imagesRef = useRef(images)

  imagesRef.current = images

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.file) {
          URL.revokeObjectURL(image.preview)
        }
      })
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleImageSelect(event) {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    const newImages = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }))

    setImages((currentImages) => [...currentImages, ...newImages])
    event.target.value = ''
  }

  function handleRemoveImage(imageId) {
    setImages((currentImages) => {
      const target = currentImages.find((image) => image.id === imageId)

      if (target?.file) {
        URL.revokeObjectURL(target.preview)
      }

      return currentImages.filter((image) => image.id !== imageId)
    })
  }

  function validateForm() {
    const nextErrors = {}
    const price = Number(formValues.price)

    if (!formValues.name.trim()) {
      nextErrors.name = 'Ce champ est obligatoire.'
    }

    if (!formValues.price) {
      nextErrors.price = 'Ce champ est obligatoire.'
    } else if (Number.isNaN(price) || price <= 0) {
      nextErrors.price = 'Le prix doit être un nombre positif.'
    }

    if (!formValues.description.trim()) {
      nextErrors.description = 'Ce champ est obligatoire.'
    }

    if (!formValues.stockStatus) {
      nextErrors.stockStatus = 'Ce champ est obligatoire.'
    }

    if (!formValues.category) {
      nextErrors.category = 'Ce champ est obligatoire.'
    }

    if (images.length === 0) {
      nextErrors.images = 'Ajoutez au moins une photo.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      name: formValues.name.trim(),
      price: Number(formValues.price),
      description: formValues.description.trim(),
      stockStatus: formValues.stockStatus,
      stockQuantity: formValues.stockStatus === 'in' ? 1 : 0,
      category: formValues.category,
      images: images.map((image) => ({
        preview: image.preview,
        file: image.file ?? null,
        isExisting: image.isExisting ?? false,
      })),
    })
  }

  function handleDeleteClick() {
    if (!onDelete) {
      return
    }

    const confirmed = window.confirm('Supprimer ce produit ? Cette action est définitive.')

    if (confirmed) {
      onDelete()
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <span className="text-sm font-medium text-black-text">Photos du produit</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="mt-2 block w-full text-sm text-gray-text file:mr-3 file:rounded-md file:border file:border-gray-border file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black-text hover:file:bg-gray-bg"
        />
        {errors.images && <p className="mt-1 text-xs text-red-main">{errors.images}</p>}

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-border">
                <img src={image.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-gray-text transition-colors duration-200 hover:text-red-main"
                  aria-label="Retirer cette image"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TODO: brancher l'upload réel des images vers AWS S3 ou Cloudinary une fois le backend prêt */}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-black-text">Nom du produit</span>
        <input
          type="text"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          className={inputClassName}
        />
        {errors.name && <p className="mt-1 text-xs text-red-main">{errors.name}</p>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-black-text">Prix du produit (MAD)</span>
        <input
          type="number"
          name="price"
          min="0"
          step="1"
          value={formValues.price}
          onChange={handleChange}
          className={inputClassName}
        />
        {errors.price && <p className="mt-1 text-xs text-red-main">{errors.price}</p>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-black-text">Description détaillée</span>
        <textarea
          name="description"
          rows={5}
          value={formValues.description}
          onChange={handleChange}
          className={textareaClassName}
        />
        {errors.description && <p className="mt-1 text-xs text-red-main">{errors.description}</p>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-black-text">Disponibilité</span>
        <select
          name="stockStatus"
          value={formValues.stockStatus}
          onChange={handleChange}
          className={inputClassName}
        >
          <option value="in">En stock</option>
          <option value="out">Hors stock</option>
        </select>
        {errors.stockStatus && <p className="mt-1 text-xs text-red-main">{errors.stockStatus}</p>}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-black-text">Catégorie du produit</span>
        <select
          name="category"
          value={formValues.category}
          onChange={handleChange}
          className={inputClassName}
        >
          <option value="">Sélectionner une catégorie</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-main">{errors.category}</p>}
      </label>

      {mode === 'edit' && onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className="text-sm font-medium text-red-main transition-colors duration-200 hover:text-red-dark"
        >
          Supprimer le produit
        </button>
      )}

      <button
        type="submit"
        className="h-11 w-full rounded-lg bg-red-main text-sm font-medium text-white transition-colors duration-200 hover:bg-red-dark"
      >
        {mode === 'edit' ? 'Enregistrer les modifications' : 'Publier le produit'}
      </button>
    </form>
  )
}

export default ProductForm
