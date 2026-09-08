import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import TopAnnouncementBar from './components/TopAnnouncementBar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import { changeLanguage, getSavedLanguage } from './utils/googleTranslate'


const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ParentCategoryPage = lazy(() => import('./pages/ParentCategoryPage'))
const BrandPage = lazy(() => import('./pages/BrandPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CGUPage = lazy(() => import('./pages/CGUPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const LegalNoticesPage = lazy(() => import('./pages/LegalNoticesPage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SellerSignupPage = lazy(() => import('./pages/vendeur/SellerSignupPage'))
const SellerDashboardPage = lazy(() => import('./pages/vendeur/SellerDashboardPage'))
const AddProductPage = lazy(() => import('./pages/vendeur/AddProductPage'))
const EditProductPage = lazy(() => import('./pages/vendeur/EditProductPage'))
const SellerSettingsPage = lazy(() => import('./pages/vendeur/SellerSettingsPage'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminVendorsPage = lazy(() => import('./pages/admin/AdminVendorsPage'))
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminDeliveriesPage = lazy(() => import('./pages/admin/AdminDeliveriesPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'))

const hiddenHeaderPaths = new Set([
  '/admin',
  '/admin/dashboard',
  '/admin/vendeurs',
  '/admin/clients',
  '/admin/commandes',
  '/admin/livraisons',
  '/admin/categories',
  '/admin/demandes',
  '/connexion',
  '/inscription',
  '/vendeur/inscription',
  '/vendeur/dashboard',
  '/vendeur/produits/ajouter',
  '/vendeur/parametres',
])

const hiddenHeaderPrefixes = ['/vendeur/produits/modifier/']

function shouldHideMarketplaceChrome(pathname) {
  if (hiddenHeaderPaths.has(pathname)) {
    return true
  }

  return hiddenHeaderPrefixes.some((prefix) => pathname.startsWith(prefix))
}

function App() {
  const location = useLocation()
  const hideMarketplaceChrome = shouldHideMarketplaceChrome(location.pathname)

  useEffect(() => {
    changeLanguage(getSavedLanguage())
  }, [])

  return (
    <ErrorBoundary>
      <ScrollToTop />

      {!hideMarketplaceChrome && (
        <>
          <TopAnnouncementBar />
          <Header />
        </>
      )}

      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-text">Chargement...</div>}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categorie/:nomCategorie" element={<CategoryPage />} />
        <Route path="/categorie-parent/:slug" element={<ParentCategoryPage />} />
        <Route path="/marque/:slug" element={<BrandPage />} />
        <Route path="/produit/:id" element={<ProductPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<SignupPage />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/commande" element={<CheckoutPage />} />
        <Route path="/confirmation-commande" element={<OrderConfirmationPage />} />
        <Route path="/mon-compte" element={<PlaceholderPage title="Mon compte" />} />
        <Route path="/boutique/:vendeurId" element={<BrandPage />} />
        <Route
          path="/mes-commandes"
          element={
            <ProtectedRoute requiredRole="CLIENT">
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/cgu" element={<CGUPage />} />
        <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/mentions-legales" element={<LegalNoticesPage />} />
        <Route path="/admin" element={<PlaceholderPage title="Administration" />} />
        <Route path="/admin/connexion" element={<Navigate to="/connexion" replace />} />
        <Route path="/vendeur/connexion" element={<Navigate to="/connexion" replace />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vendeurs"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminVendorsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminClientsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/commandes"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminOrdersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/livraisons"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminDeliveriesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminCategoriesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/demandes"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <AdminRequestsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/vendeur/inscription" element={<SellerSignupPage />} />
        <Route
          path="/vendeur/dashboard"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendeur/produits/ajouter"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendeur/produits/modifier/:id"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendeur/commandes"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <Navigate to="/vendeur/parametres?section=mes-commandes" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendeur/parametres"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <SellerSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {!hideMarketplaceChrome && <Footer />}
    </ErrorBoundary>
  )
}

export default App
