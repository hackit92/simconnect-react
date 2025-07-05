import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Globe, ShoppingCart, User, LogIn } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

export const FullscreenMenu: React.FC<FullscreenMenuProps> = ({
  isOpen,
  onClose,
  user,
  onLogout
}) => {
  const { t, i18n } = useTranslation();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { getTotalItems } = useCart();
  const location = useLocation();

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleNavigation = () => {
    onClose();
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-8 w-auto"
                    alt="SimConnect Travel Logo"
                    src="/image-1.png"
                  />
                  <span className="text-xl font-semibold text-gray-900">Menu</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <motion.div
                className="p-8 space-y-8"
                variants={staggerContainer}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {/* Navigation Links */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/"
                      onClick={handleNavigation}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                        location.pathname === '/'
                          ? 'bg-primary/10 text-primary border-2 border-primary/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Home className="w-6 h-6" />
                      <span className="font-medium">{t('nav.home')}</span>
                    </Link>

                    <Link
                      to="/plans"
                      onClick={handleNavigation}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                        location.pathname === '/plans'
                          ? 'bg-primary/10 text-primary border-2 border-primary/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Globe className="w-6 h-6" />
                      <span className="font-medium">{t('nav.plans')}</span>
                    </Link>

                    <Link
                      to="/cart"
                      onClick={handleNavigation}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                        location.pathname === '/cart'
                          ? 'bg-primary/10 text-primary border-2 border-primary/20'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="relative">
                        <ShoppingCart className="w-6 h-6" />
                        {getTotalItems() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {getTotalItems()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{t('nav.cart')}</span>
                    </Link>

                    {user ? (
                      <Link
                        to="/products"
                        onClick={handleNavigation}
                        className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                          location.pathname === '/products'
                            ? 'bg-primary/10 text-primary border-2 border-primary/20'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <User className="w-6 h-6" />
                        <span className="font-medium">{t('nav.account')}</span>
                      </Link>
                    ) : (
                      <a
                        href="https://my.simconnect.travel/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleNavigation}
                        className="flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                      >
                        <LogIn className="w-6 h-6" />
                        <span className="font-medium">{t('nav.login')}</span>
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Language & Currency */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                  
                  {/* Language Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Idioma</label>
                    <div className="grid grid-cols-2 gap-3">
                      {languages.map((language) => (
                        <button
                          key={language.value}
                          onClick={() => handleLanguageChange(language.value)}
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                            i18n.language === language.value
                              ? 'bg-primary/10 text-primary border-2 border-primary/20'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="text-xl">{language.flag}</span>
                          <span className="font-medium">{language.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Moneda</label>
                    <div className="grid grid-cols-3 gap-3">
                      {currencies.map((currency) => (
                        <button
                          key={currency.value}
                          onClick={() => handleCurrencyChange(currency.value)}
                          className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 ${
                            selectedCurrency === currency.value
                              ? 'bg-primary/10 text-primary border-2 border-primary/20'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="text-xl font-bold">{currency.symbol}</span>
                          <span className="text-xs font-medium">{currency.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* User Actions */}
                {user && (
                  <motion.div variants={itemVariants} className="pt-6 border-t border-gray-100">
                    <button
                      onClick={() => {
                        onLogout();
                        handleNavigation();
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">{t('auth.logout')}</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};