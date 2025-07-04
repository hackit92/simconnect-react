import React from 'react';
import { ShoppingCartIcon } from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { supabase } from "../lib/supabase";
import { Home } from "../screens/Home";
import { Cart } from "../screens/Cart";
import { Products } from "../screens/Products";
import { Success } from "../screens/Success";
import { CheckoutForm } from "../screens/CheckoutForm";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

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

export const DesktopAppLayout: React.FC = () => {
  const { getTotalItems } = useCart();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                className="h-10 w-auto"
                alt="SimConnect Travel Logo"
                src="/image-1.png"
              />
            </Link>

            {/* Right side controls */}
            <div className="flex items-center space-x-6">
              {/* Language Selector */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 transition-colors duration-200 ${
                    i18n.language === 'en' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  EN
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`px-2 py-1 transition-colors duration-200 ${
                    i18n.language === 'es' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ES
                </button>
              </div>

              {/* Currency Selector */}
              <Popover>
                <PopoverTrigger className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  <span>({selectedCurrency})</span>
                  <span>{currencies.find(c => c.value === selectedCurrency)?.symbol}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1 rounded-xl">
                  <div className="space-y-0.5">
                    {currencies.map((currency) => (
                      <button
                        key={currency.value}
                        onClick={() => handleCurrencyChange(currency.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all
                          ${selectedCurrency === currency.value
                            ? 'bg-primary/10 text-primary font-medium'
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
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-6 w-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Icon */}
              {user ? (
                <Popover>
                  <PopoverTrigger className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 rounded-xl">
                    <div className="space-y-1">
                      <Link
                        to="/products"
                        className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {t('products.title')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {t('auth.logout')}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm font-medium"
                >
                 {t('nav.login')}
                </Link>
              )}

              {/* Menu Icon */}
              <button className="p-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};