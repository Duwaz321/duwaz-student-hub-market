import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Business } from '@/types';

interface ShopContextValue {
  myShop: Business | null;
  isLoadingShop: boolean;
  setMyShop: (shop: Business | null) => void;
  clearShop: () => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const SHOP_KEY = 'duwaz_my_shop';

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [myShop, setMyShopState] = useState<Business | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SHOP_KEY);
    if (stored) {
      try {
        setMyShopState(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SHOP_KEY);
      }
    }
    setIsLoadingShop(false);
  }, []);

  const setMyShop = useCallback((shop: Business | null) => {
    setMyShopState(shop);
    if (shop) {
      localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
    } else {
      localStorage.removeItem(SHOP_KEY);
    }
  }, []);

  const clearShop = useCallback(() => {
    setMyShopState(null);
    localStorage.removeItem(SHOP_KEY);
  }, []);

  return (
    <ShopContext.Provider value={{ myShop, isLoadingShop, setMyShop, clearShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShopContext() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShopContext must be used inside <ShopProvider>');
  return ctx;
}
