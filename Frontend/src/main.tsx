import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ShopProvider } from './context/ShopContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <AuthProvider>
      <ShopProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ShopProvider>
    </AuthProvider>
  </ThemeProvider>
);
