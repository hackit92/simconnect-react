import React from 'react';
import { HomeIcon, ShoppingCartIcon, GlobeIcon } from "lucide-react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../contexts/CartContext";
import { Home } from "../screens/Home";
import { Plans } from "../screens/Plans";
import { Cart } from "../screens/Cart";

export const MobileAppLayout: React.FC = () => {
  const { getTotalItems } = useCart();
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] backdrop-blur-sm bg-white/80 border-t border-gray-100 z-50">
        <div className="flex items-center justify-around py-3 px-6">
          <Link 
            to="/" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('nav.home')}</span>
          </Link>

          <Link 
            to="/plans" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/plans' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <GlobeIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('nav.plans')}</span>
          </Link>

          <Link 
            to="/cart" 
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              location.pathname === '/cart' 
                ? 'text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="relative">
              <ShoppingCartIcon className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t('nav.cart')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};