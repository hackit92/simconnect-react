import React from 'react';
import { ShoppingCartIcon, User, Menu, Globe } from "lucide-react";
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
import { CompatibilityChecker } from "../screens/CompatibilityChecker";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { FullscreenMenu } from "../components/navigation/FullscreenMenu";

export const DesktopAppLayout: React.FC = () => {
  const { getTotalItems } = useCart();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
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
              <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Globe className="w-4 h-4" />
                <select 
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>

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
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              ) : (
                <a
                  href="https://my.simconnect.travel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm font-medium"
                >
                  <User className="h-6 w-6" />
                </a>
              )}

              {/* Menu Icon */}
              <button 
                onClick={handleMenuToggle}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compatibility" element={<CompatibilityChecker />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Fullscreen Menu */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
};