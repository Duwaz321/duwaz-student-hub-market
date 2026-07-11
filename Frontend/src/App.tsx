import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShopPage from './pages/ShopPage';
import CreateShopPage from './pages/CreateShopPage';
import AboutPage from './pages/AboutPage';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no Layout wrapper (full-screen cards) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app — all inside Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="shop/:id" element={<ShopPage />} />
            <Route path="about" element={<AboutPage />} />

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
            <Route path="cart" element={<CartPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
