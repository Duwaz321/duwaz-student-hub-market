import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ShopLoader from './components/ShopLoader';
import ErrorBoundary from './components/ErrorBoundary';

// ── Static imports — small, needed immediately ────────────────────────────────
import HomePage          from './pages/HomePage';
import MarketplacePage   from './pages/MarketplacePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import NotFound          from './pages/NotFound';
import TermsPage          from './pages/TermsPage';
import PrivacyPage        from './pages/PrivacyPage';
import RefundsPage        from './pages/RefundsPage';
import SellerTermsPage    from './pages/SellerTermsPage';

// ── Lazy imports — heavy pages, not needed until user navigates to them ───────
const ProductDetailPage   = lazy(() => import('./pages/ProductDetailPage'));
const ShopPage            = lazy(() => import('./pages/ShopPage'));
const CreateShopPage      = lazy(() => import('./pages/CreateShopPage'));
const MyShopsPage         = lazy(() => import('./pages/MyShopsPage'));
const ShopDashboardPage   = lazy(() => import('./pages/ShopDashboardPage'));
const AdminDashboardPage  = lazy(() => import('./pages/AdminDashboardPage'));
const DriverDashboardPage = lazy(() => import('./pages/DriverDashboardPage'));
const DriverLoginPage     = lazy(() => import('./pages/DriverLoginPage'));
const AboutPage           = lazy(() => import('./pages/AboutPage'));
const AccountPage         = lazy(() => import('./pages/AccountPage'));
const CartPage            = lazy(() => import('./pages/CartPage'));
const OrderTrackingPage   = lazy(() => import('./pages/OrderTrackingPage'));
const MyOrdersPage        = lazy(() => import('./pages/MyOrdersPage'));
const PaymentSuccessPage  = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage   = lazy(() => import('./pages/PaymentCancelPage'));
const CategoryListPage    = lazy(() => import('./pages/CategoryListPage'));
const ServiceListPage     = lazy(() => import('./pages/ServiceListPage'));
const PurchaseSuccessPage = lazy(() => import('./pages/PurchaseSuccessPage'));
const ServiceOrderPage    = lazy(() => import('./pages/ServiceOrderPage'));

// Minimal fallback shown while a lazy page chunk loads (< 200ms on fast connections)
const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-duwaz-brown/30 border-t-duwaz-brown rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus — avoids unnecessary requests on mobile
      // when user switches apps and returns to browser
      refetchOnWindowFocus: false,
      // Retry failed requests once (not 3 times default) — faster failure feedback
      retry: 1,
      // Default staleTime: 60s for anything not explicitly overridden
      staleTime: 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ShopLoader />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
          {/* Auth pages — no Layout wrapper (full-screen cards) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/driver/login" element={<DriverLoginPage />} />

          {/* Payment redirect pages — no Layout (full-screen feedback) */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel"  element={<PaymentCancelPage />} />
          <Route path="/purchase/success/:orderId" element={<PurchaseSuccessPage />} />

          {/* Driver dashboard — no marketplace Layout */}
          <Route
            path="/driver"
            element={
              <RoleProtectedRoute requiredRole="DRIVER">
                <DriverDashboardPage />
              </RoleProtectedRoute>
            }
          />

          {/* Main app — all inside Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="services" element={<ServiceListPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="shop/:id" element={<ShopPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="seller-terms" element={<SellerTermsPage />} />

            {/* Service inquiry page */}
            <Route path="service-order/:id" element={<ServiceOrderPage />} />

            {/* Protected routes */}
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-shop"
              element={
                <ProtectedRoute>
                  <CreateShopPage />
                </ProtectedRoute>
              }
            />
            {/* All shops list */}
            <Route
              path="my-shops"
              element={
                <ProtectedRoute>
                  <MyShopsPage />
                </ProtectedRoute>
              }
            />
            {/* Individual shop dashboard — /my-shop/:id */}
            <Route
              path="my-shop/:shopId"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ShopDashboardPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            {/* Legacy /my-shop → redirect to list */}
            <Route
              path="my-shop"
              element={
                <ProtectedRoute>
                  <MyShopsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <RoleProtectedRoute requiredRole="ADMIN">
                  <ErrorBoundary>
                    <AdminDashboardPage />
                  </ErrorBoundary>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="cart"
              element={
                <ErrorBoundary>
                  <CartPage />
                </ErrorBoundary>
              }
            />

            {/* Orders */}
            <Route
              path="my-orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="order/:orderId/track"
              element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
