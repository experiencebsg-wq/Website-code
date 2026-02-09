import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, CartItem } from '@/services/api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => { ngn: number; usd: number };
  isInCart: (productId: string, selectedSize?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bsg-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isInitialized]);

  const addItem = (product: Product, quantity = 1, selectedSize?: string) => {
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(
        item => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const newItems = [...currentItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      return [...currentItems, { product, quantity, selectedSize }];
    });
  };

  const removeItem = (productId: string, selectedSize?: string) => {
    setItems(currentItems =>
      currentItems.filter(
        item => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedSize);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce(
      (totals, item) => {
        const price = item.selectedSize && item.product.sizes
          ? item.product.sizes.find(s => s.size === item.selectedSize)?.price || item.product.price
          : item.product.price;
        const priceUSD = item.selectedSize && item.product.sizes
          ? item.product.sizes.find(s => s.size === item.selectedSize)?.priceUSD || item.product.priceUSD
          : item.product.priceUSD;

        return {
          ngn: totals.ngn + price * item.quantity,
          usd: totals.usd + priceUSD * item.quantity,
        };
      },
      { ngn: 0, usd: 0 }
    );
  };

  const isInCart = (productId: string, selectedSize?: string) => {
    return items.some(
      item => item.product.id === productId && item.selectedSize === selectedSize
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
