import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const AUTH_STORAGE_KEY = 'dibladi_auth'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('dibladi_token')
    if (!token) {
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          token = parsed?.token
        }
      } catch {
        // ignore malformed auth payload
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


export const fetchCategories = () => api.get('/api/categories')
export const fetchBrands = () => api.get('/api/brands')
export const fetchVendors = () => api.get('/api/vendors')
export const fetchProducts = (params = {}) => api.get('/api/products', { params })
export const fetchParentCategories = () => api.get('/api/parent-categories').then((response) => response.data)
export const fetchParentCategoryCategories = (slug) => api.get(`/api/parent-categories/${slug}/categories`).then((response) => response.data)
export const globalSearch = (query) => api.get('/api/search/global', { params: { query } })
export const fetchProductById = (id) => api.get(`/api/products/${id}`)
export const updateProduct = (id, payload) => api.put(`/api/products/${id}`, payload)
export const deleteProduct = (id) => api.delete(`/api/products/${id}`)
export const login = (credentials) => api.post('/api/auth/login', credentials)
export const registerClient = (payload) => api.post('/api/auth/register/client', payload)
export const registerVendor = (payload) => api.post('/api/auth/register/vendor', payload)
export const uploadVendorPhoto = (formData) =>
  api.post('/api/upload/vendor-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const uploadProductImage = (formData) =>
  api.post('/api/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const uploadCategoryImage = (formData) =>
  api.post('/api/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const fetchAdminDashboard = () => api.get('/api/admin/dashboard')
export const fetchAdminVendors = () => api.get('/api/admin/vendors')
export const fetchAdminClients = () => api.get('/api/admin/clients')
export const fetchAdminOrders = () => api.get('/api/admin/orders')
export const fetchAdminDeliveries = () => api.get('/api/admin/deliveries')
export const updateAdminDeliveryStatus = (id, status) => api.put(`/api/admin/deliveries/${id}/status`, { status })
export const fetchAdminVendorRequests = (params = {}) => api.get('/api/admin/requests', { params })
export const fetchAdminRequests = (params = {}) => api.get('/api/admin/requests', { params })
export const approveVendorRequest = (id) => api.post(`/api/admin/requests/${id}/approve`)
export const rejectVendorRequest = (id) => api.post(`/api/admin/requests/${id}/reject`)
export const fetchAdminCategories = () => api.get('/api/admin/categories')
export const fetchAdminParentCategories = () => api.get('/api/admin/parent-categories')
export const updateAdminParentCategory = (id, payload) => api.put(`/api/admin/parent-categories/${id}`, payload)
export const createAdminCategory = (payload) => api.post('/api/admin/categories', payload)
export const updateAdminCategory = (id, payload) => api.put(`/api/admin/categories/${id}`, payload)
export const deleteAdminCategory = (id) => api.delete(`/api/admin/categories/${id}`)
export const updateAdminVendorScore = (id, score) => api.put(`/api/admin/vendors/${id}/score`, { score })
export const createOrder = (payload) => api.post('/api/orders', payload)
export const fetchMyOrders = () => api.get('/api/orders/my-orders')
export const fetchVendorOrders = () => api.get('/api/orders/vendor-orders')
export const createReview = (payload) => api.post('/api/reviews', payload)
export const fetchReviewsByProduct = (productId) => api.get('/api/reviews', { params: { productId } })
export const replyToReview = (id, reply) => api.put(`/api/reviews/${id}/reply`, { reply })
export const deleteReview = (id) => api.delete(`/api/reviews/${id}`)
export const fetchCurrentVendorProfile = () => api.get('/api/vendors/me')
export const updateCurrentVendorProfile = (payload) => api.put('/api/vendors/me', payload)

export const fetchCategoryAttributes = (categoryId) =>
  api.get(`/api/categories/${categoryId}/attributes`).then((response) => response.data)
export const fetchProductVariants = (productId) =>
  api.get(`/api/products/${productId}/variants`).then((response) => response.data)
export const createProductWithVariants = (data) => api.post('/api/products', data).then((response) => response.data)
export const updateProductVariant = (productId, variantId, data) =>
  api.put(`/api/products/${productId}/variants/${variantId}`, data).then((response) => response.data)
export const createProductVariant = (productId, data) =>
  api.post(`/api/products/${productId}/variants`, data).then((response) => response.data)

export { AUTH_STORAGE_KEY }
export default api

