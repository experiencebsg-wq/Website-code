import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceNGN: number, priceUSD: number) => string;
  formatPriceValue: (priceNGN: number, priceUSD: number) => number;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsg-currency');
      return (saved as Currency) || 'NGN';
    }
    return 'NGN';
  });

  useEffect(() => {
    localStorage.setItem('bsg-currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const toggleCurrency = () => {
    setCurrencyState(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  const formatPrice = (priceNGN: number, priceUSD: number): string => {
    const price = currency === 'NGN' ? priceNGN : priceUSD;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceValue = (priceNGN: number, priceUSD: number): number => {
    return currency === 'NGN' ? priceNGN : priceUSD;
  };

  const currencySymbol = currency === 'NGN' ? '₦' : '$';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatPriceValue,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
