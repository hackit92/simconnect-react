import React, { useCallback } from 'react';
import { HomeIcon, ShoppingCartIcon, GlobeIcon, UserIcon, User, Menu } from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import { useCurrency } from "../contexts/CurrencyContext";
import { useCart } from "../contexts/CartContext";
import { supabase } from "../lib/supabase";
import { Home } from "../screens/Home";
import { Plans } from "../screens/Plans";
import { Cart } from "../screens/Cart";
import { Products } from "../screens/Products";
import { BlogPost } from "../screens/BlogPost";
import { Success } from "../screens/Success";
import { CheckoutForm } from "../screens/CheckoutForm";
import { CompatibilityChecker } from "../screens/CompatibilityChecker";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { FullscreenMenu } from "../components/navigation/FullscreenMenu";
import { Footer } from "../components/Footer";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../components/ui/navigation-menu";
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

export const MobileAppLayout: React.FC = () => {
  const { getTotalItems } = useCart();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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

  const handleCurrencyChange = useCallback((value: string) => {
    setSelectedCurrency(value);
  }, [setSelectedCurrency]);

  const handleLanguageChange = useCallback((language: string) => {
    i18n.changeLanguage(language);
  }, [i18n]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
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
                            ? 'bg-primary/10 text-primary font-medium'
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

      {/* Main Content */}
      <div className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/compatibility" element={<CompatibilityChecker />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Footer - Only show on home page in mobile */}
        {location.pathname === '/' && <Footer />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] backdrop-blur-sm bg-white/80 border-t border-gray-100 z-50">
        <div className="flex items-center justify-around py-3 px-6">
          <Link 
            to="/" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/' 
                ? 'text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('nav.home')}</span>
          </Link>

          <Link 
            to="/plans" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/plans' 
                ? 'text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <GlobeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('nav.plans')}</span>
          </Link>

          <Link 
            to="/cart" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/cart' 
                ? 'text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <div className="relative">
              <ShoppingCartIcon className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t('nav.cart')}</span>
          </Link>

          {user ? (
            <Link 
              to="/products"
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                location.pathname === '/products'
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {t('nav.account')}
              </span>
            </Link>
          ) : (
            <a 
              href="https://my.simconnect.travel/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {t('nav.login')}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};