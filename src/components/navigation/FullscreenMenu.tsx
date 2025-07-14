import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Globe, ShoppingCart, User, LogIn, Phone, Mail, HelpCircle, MessageCircle } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';

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
  const { t } = useTranslation();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  const handleNavigation = () => {
    onClose();
  };

  const handlePlansClick = () => {
    if (isDesktop) {
      // On desktop, scroll to plans section
      const plansSection = document.getElementById('plans-section');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth' });
      }
      onClose();
    } else {
      // On mobile, navigate to plans page (though menu won't show on mobile)
      window.location.href = '/plans';
      onClose();
    }
  };
  const menuVariants = {
    closed: {
      opacity: 0,
      x: '-100%',
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const menuItems = [
    { path: '/', label: 'Inicio', icon: <Home className="w-6 h-6" /> },
    { path: '/plans', label: 'Planes', icon: <Globe className="w-6 h-6" />, isPlans: true },
    { path: '/compatibility', label: 'Compatibilidad', icon: <Phone className="w-6 h-6" /> },
    { path: '/cart', label: 'Carrito', icon: <ShoppingCart className="w-6 h-6" /> },
    { path: '/products', label: 'Mi Cuenta', icon: <User className="w-6 h-6" />, requiresAuth: true },
    { externalLink: 'https://my.simconnect.travel/', label: 'Iniciar Sesión', icon: <LogIn className="w-6 h-6" />, requiresNoAuth: true },
  ];

  const supportItems = [
    { label: 'Preguntas Frecuentes', icon: <HelpCircle className="w-6 h-6" /> },
    { label: 'Ayuda', icon: <MessageCircle className="w-6 h-6" /> },
    { label: 'Contacto', icon: <Phone className="w-6 h-6" /> },
  ];

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
            className="fixed inset-y-0 left-0 z-50 w-full md:w-[400px] bg-white shadow-2xl flex flex-col"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <img
                  className="h-8 w-auto"
                  alt="SimConnect Travel Logo"
                  src="/image-1.png"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                className="p-6 space-y-8"
                variants={staggerContainer}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {/* Navigation Links */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="space-y-3">
                    {menuItems.map((item) => {
                      // Skip items that require authentication if user is not logged in
                      if (item.requiresAuth && !user) return null;
                      // Skip items that require no authentication if user is logged in
                      if (item.requiresNoAuth && user) return null;

                      if (item.externalLink) {
                        return (
                          <a
                            key={item.label}
                            href={item.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleNavigation}
                            className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                          >
                            {item.icon}
                            <span className="text-xl font-medium">{item.label}</span>
                          </a>
                        );
                      }

                      // Handle Plans section specially
                      if (item.isPlans) {
                        return (
                          <button
                            key={item.label}
                            onClick={handlePlansClick}
                            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                              location.pathname === item.path
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.icon}
                            <span className="text-xl font-medium">{item.label}</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleNavigation}
                          className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                            location.pathname === item.path
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.icon}
                          <span className="text-xl font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Support Links */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 px-4">Soporte</h3>
                  <div className="space-y-3">
                    {supportItems.map((item) => (
                      <a
                        key={item.label}
                        href="#"
                        className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                      >
                        {item.icon}
                        <span className="text-xl font-medium">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 px-4">Contáctanos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 text-gray-700">
                      <Phone className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">+1 (888) 286-0080</p>
                        <p className="text-xs text-gray-500">Soporte 24/7</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 text-gray-700">
                      <Mail className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">support@simconnect.travel</p>
                        <p className="text-xs text-gray-500">Respuesta en 24h</p>
                      </div>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};