import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyProvider, useCurrency } from "../../contexts/CurrencyContext";
import { CartProvider, useCart } from "../../contexts/CartContext";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { MobileAppLayout } from "../../layouts/MobileAppLayout";
import { DesktopAppLayout } from "../../layouts/DesktopAppLayout";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../../components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

const currencies: CurrencyOption[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "MXN", label: "Peso Mexicano", symbol: "$" },
];

const languages: LanguageOption[] = [
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "en", label: "English", flag: "🇺🇸" },
];

const regionOptions = [
  { value: "americas", label: "Americas" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
];

const FrameContent = (): JSX.Element => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { i18n, t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleSync = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-woocommerce`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Sync successful:', result);
      alert('Sync completed successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing data. Please check the console for details.');
    }
  };

  const handleCurrencyChange = useCallback((value: string) => {
    setSelectedCurrency(value);
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    i18n.changeLanguage(language);
  }, []);

  return (
    <div className="w-full h-full">
      {/* Global Controls - Only show on mobile */}
      {!isDesktop && (
        <div className="bg-transparent flex flex-row justify-center w-full">
          <div className="w-[390px] min-h-[853px]">
            <div className="flex flex-col w-full h-full items-start bg-white">
              <header className="flex h-[59px] items-center justify-between px-4 pt-4 pb-2 w-full bg-white border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <img
                    className="w-[171px] h-[26px] object-cover"
                    alt="SimConnect Mobile Logo"
                    src="/image-1.png"
                  />
                </div>
                <NavigationMenu>
                  <NavigationMenuList className="flex items-center gap-3">
                    <NavigationMenuItem>
                      <Popover>
                        <PopoverTrigger className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white hover:bg-gray-50 rounded-full border border-gray-200 transition-all">
                          <span className="text-gray-900">{currencies.find(c => c.value === selectedCurrency)?.symbol}</span>
                          <span className="text-gray-600">{selectedCurrency}</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1 rounded-xl">
                          <div className="space-y-0.5">
                            {currencies.map((currency) => (
                              <button
                                key={currency.value}
                                onClick={() => handleCurrencyChange(currency.value)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
                                  ${selectedCurrency === currency.value
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                              >
                                <span className="text-lg">{currency.symbol}</span>
                                <span>{currency.label}</span>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Popover>
                        <PopoverTrigger className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white hover:bg-gray-50 rounded-full border border-gray-200 transition-all">
                          <span>{languages.find(l => l.value === i18n.language)?.flag}</span>
                          <span className="text-gray-600">{i18n.language.toUpperCase()}</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1 rounded-xl">
                          <div className="space-y-0.5">
                            {languages.map((language) => (
                              <button
                                key={language.value}
                                onClick={() => handleLanguageChange(language.value)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
                                  ${i18n.language === language.value
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                <span className="text-lg">{language.flag}</span>
                                <span>{language.label}</span>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </header>
              
              <MobileAppLayout />
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Layout */}
      {isDesktop && (
        <div className="w-full">
          {/* Global Controls for Desktop */}
          <div className="fixed top-4 right-4 z-50">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-3">
                <NavigationMenuItem>
                  <Popover>
                    <PopoverTrigger className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white hover:bg-gray-50 rounded-full border border-gray-200 transition-all shadow-sm">
                      <span className="text-gray-900">{currencies.find(c => c.value === selectedCurrency)?.symbol}</span>
                      <span className="text-gray-600">{selectedCurrency}</span>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1 rounded-xl">
                      <div className="space-y-0.5">
                        {currencies.map((currency) => (
                          <button
                            key={currency.value}
                            onClick={() => handleCurrencyChange(currency.value)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
                              ${selectedCurrency === currency.value
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            <span className="text-lg">{currency.symbol}</span>
                            <span>{currency.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Popover>
                    <PopoverTrigger className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white hover:bg-gray-50 rounded-full border border-gray-200 transition-all shadow-sm">
                      <span>{languages.find(l => l.value === i18n.language)?.flag}</span>
                      <span className="text-gray-600">{i18n.language.toUpperCase()}</span>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1 rounded-xl">
                      <div className="space-y-0.5">
                        {languages.map((language) => (
                          <button
                            key={language.value}
                            onClick={() => handleLanguageChange(language.value)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
                              ${i18n.language === language.value
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <DesktopAppLayout />
        </div>
      )}
      </div>
    </div>
  );
};

export const Frame = (): JSX.Element => {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          <FrameContent />
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  );
};