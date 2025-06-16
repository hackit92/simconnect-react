import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  getCurrencySymbol: (currency: string) => string;
  formatPrice: (amount: number | null | undefined, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'MXN':
        return '$';
      default:
        return '$';
    }
  };

  const formatPrice = (amount: number | null | undefined, currency?: string): string => {
    const curr = currency || selectedCurrency;
    const symbol = getCurrencySymbol(curr);
    
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${symbol}--`;
    }
    
    // Format as integer (no decimal places for fixed prices)
    const formatted = Math.round(amount).toString();
    return `${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        getCurrencySymbol,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};