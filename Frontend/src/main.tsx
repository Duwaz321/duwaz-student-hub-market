import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);
