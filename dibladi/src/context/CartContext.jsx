import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(undefined)

const CART_STORAGE_KEY = 'dibladi_cart'

function sameCartItem(item, id, variantId = null) {
  return item.id === id && (item.variantId ?? null) === (variantId ?? null)
}

function parseDeliveryFee(value) {
  if (value == null || value === '') {
    return 30
  }

  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return numeric
  }

  const digits = String(value).replace(/[^0-9.-]/g, '')
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? parsed : 30
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map((item) => ({
      ...item,
      deliveryFee: parseDeliveryFee(item.deliveryFee ?? item.deliveryFeeValue),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      sellerId: item.sellerId ?? item.vendorId ?? '',
      vendorId: item.vendorId ?? item.sellerId ?? null,
    }))
  } catch {
    return []
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors (quota, etc.)
  }
}

function CartProvider({ children }) {
  const [items, setItems] = useState(loadCartFromStorage)

  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  const addToCart = useCallback(function addToCart(product, quantity = 1) {
    if (!product || quantity <= 0) {
      return
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => sameCartItem(item, product.id, product.variantId),
      )

      if (existingItem) {
        return currentItems.map((item) =>
          sameCartItem(item, product.id, product.variantId)
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: Number(product.priceValue ?? product.price ?? 0),
          deliveryFee: Number(product.deliveryFeeValue ?? product.deliveryFee ?? 30),
          vendorId: product.vendorId ?? product.sellerId ?? null,
          quantity,
          sellerId: product.sellerId ?? product.vendorId ?? '',
          priceValue: Number(product.priceValue ?? product.price ?? 0),
          deliveryFeeValue: Number(product.deliveryFeeValue ?? product.deliveryFee ?? 30),
          variantId: product.variantId ?? null,
          variantLabel: product.variantLabel ?? null,
        },
      ]
    })
  }, [])

  const removeFromCart = useCallback(function removeFromCart(productId, variantId = null) {
    setItems((currentItems) => currentItems.filter((item) => !sameCartItem(item, productId, variantId)))
  }, [])

  const updateQuantity = useCallback(function updateQuantity(productId, newQuantity, variantId = null) {
    setItems((currentItems) => {
      if (newQuantity <= 0) {
        return currentItems.filter((item) => !sameCartItem(item, productId, variantId))
      }

      return currentItems.map((item) =>
        sameCartItem(item, productId, variantId) ? { ...item, quantity: newQuantity } : item,
      )
    })
  }, [])

  const clearCart = useCallback(function clearCart() {
    setItems([])
  }, [])

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const cartSubtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  )

  const cartDeliveryTotal = useMemo(() => {
    const vendorIds = new Set(
      items.map((item) => item.sellerId ?? item.vendorId).filter(Boolean),
    )
    return vendorIds.size * 40
  }, [items])

  const cartTotal = useMemo(
    () => cartSubtotal + cartDeliveryTotal,
    [cartSubtotal, cartDeliveryTotal],
  )

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      cartDeliveryTotal,
      cartTotal,
    }),
    [addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext, CartProvider }
