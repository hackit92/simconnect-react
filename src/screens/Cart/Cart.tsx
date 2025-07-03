import React from "react";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useCart } from "../../contexts/CartContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { countryUtils } from "../../lib/countries/countryUtils";
import { supabase, type Category } from "../../lib/supabase";

export const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { selectedCurrency, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Load categories for proper country name display
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error } = await supabase
          .from('wc_categories')
          .select('*');
        
        if (error) throw error;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    alert('Funcionalidad de pago en desarrollo. ¡Pronto estará disponible!');
  };

  const handleExplorePlans = () => {
    if (isDesktop) {
      // On desktop, navigate to home and scroll to plans section
      navigate('/');
      setTimeout(() => {
        const plansSection = document.getElementById('plans-section');
        if (plansSection) {
          plansSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // On mobile, navigate to plans page
      navigate('/plans');
    }
  };

  const getProductPrice = (item: any) => {
    switch (selectedCurrency) {
      case 'USD':
        return item.regular_price_usd || parseFloat(item.regular_price || '0') || 0;
      case 'EUR':
        return item.regular_price_eur || 0;
      case 'MXN':
        return item.regular_price_mxn || 0;
      default:
        return item.regular_price_usd || parseFloat(item.regular_price || '0') || 0;
    }
  };

  const getDisplayName = (item: any, categories: Category[]) => {
    // For regional plans, use formatted region names
    if (item.plan_type === 'regional') {
      const regionNames: Record<string, string> = {
        'latinoamerica': 'Latinoamérica',
        'europa': 'Europa',
        'norteamerica': 'Norteamérica',
        'balcanes': 'Balcanes',
        'oriente-medio': 'Oriente Medio',
        'caribe': 'Caribe',
        'asia-central': 'Asia Central y Cáucaso',
        'asia': 'Asia',
        'africa': 'África',
        'oceania': 'Oceanía'
      };
      return regionNames[item.region_code || ''] || 'Plan Regional';
    }
    
    // For country-specific plans, try to get the country name from various sources
    if (item.plan_type === 'country') {
      // Try to use country_code if available
      if (item.country_code) {
        const countryName = countryUtils.getCountryName(item.country_code);
        // Only return if it's a valid country name (not just the code)
        if (countryName !== item.country_code) {
          return countryName;
        }
      }
      
      // If no country_code or invalid, try to find the country from the product's category_ids
      if (item.category_ids && Array.isArray(item.category_ids) && categories.length > 0) {
        for (const categoryId of item.category_ids) {
          const category = categories.find(cat => cat.id === categoryId);
          if (category) {
            const countryName = countryUtils.getCountryName(category.slug);
            // Only return if it's a valid country name (not just the slug)
            if (countryName !== category.slug) {
              return countryName;
            }
          }
        }
      }
    }
    
    return 'Plan Internacional';
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${
        isDesktop ? 'px-6' : 'px-4'
      }`}>
        <div className="text-center max-w-md">
          <div className={`mx-auto mb-8 rounded-full bg-white shadow-lg flex items-center justify-center ${
            isDesktop ? 'w-24 h-24' : 'w-20 h-20'
          }`}>
            <ShoppingBag className={`text-gray-400 ${
              isDesktop ? 'w-12 h-12' : 'w-10 h-10'
            }`} />
          </div>
          <h1 className={`font-bold text-gray-900 mb-4 ${
            isDesktop ? 'text-3xl' : 'text-2xl'
          }`}>Tu carrito está vacío</h1>
          <p className={`text-gray-600 mb-8 ${
            isDesktop ? 'text-lg' : 'text-base'
          }`}>
            Explora nuestros planes de datos móviles y encuentra el perfecto para tu próximo viaje.
          </p>
          <Button
            onClick={handleExplorePlans}
            className="bg-[#299ae4] hover:bg-[#299ae4]/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Explorar Planes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`max-w-7xl mx-auto ${
        isDesktop ? 'px-6 py-8' : 'px-4 py-6'
      }`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold text-gray-900 mb-2 ${
                isDesktop ? 'text-4xl' : 'text-2xl'
              }`}>Carrito de Compras</h1>
              <p className={`text-gray-600 ${
                isDesktop ? 'text-lg' : 'text-base'
              }`}>
                {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>
            <Button
              onClick={clearCart}
              variant="outline"
              className={`text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 ${
                isDesktop ? 'px-6 py-3' : 'px-4 py-2'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items - Left Column */}
          <div className="lg:w-2/3">
            <div className="space-y-6">
              {items.map((item) => {
                const price = getProductPrice(item);
                const displayName = getDisplayName(item, categories);
                const subtotal = price * item.quantity;

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      {/* Product Info */}
                      <div className="flex-1 pr-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {displayName}
                        </h3>
                        
                        {/* Product Details */}
                        <div className={`flex items-center text-sm text-gray-600 mb-6 ${
                          isDesktop ? 'space-x-6' : 'space-x-4'
                        }`}>
                          {item.data_gb && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Datos:</span>
                              <span>
                                {item.data_gb < 1 ? `${Math.round(item.data_gb * 1024)} MB` : `${item.data_gb} GB`}
                              </span>
                            </div>
                          )}
                          {item.validity_days && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Vigencia:</span>
                              <span>{item.validity_days} días</span>
                            </div>
                          )}
                          {item.technology && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Red:</span>
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {item.technology}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quantity and Price Controls */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-3 hover:bg-gray-100 transition-colors duration-200 rounded-l-xl"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="px-6 py-3 font-semibold text-gray-900 min-w-[60px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-3 hover:bg-gray-100 transition-colors duration-200 rounded-r-xl"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatPrice(subtotal)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {formatPrice(price)} cada uno
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:w-1/3">
            <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-8 ${
              isDesktop ? 'p-8' : 'p-6'
            }`}>
              <h3 className={`font-bold text-gray-900 mb-6 ${
                isDesktop ? 'text-2xl' : 'text-xl'
              }`}>Resumen del Pedido</h3>
              
              <div className="space-y-4 mb-8">
                <div className={`flex justify-between text-gray-600 ${
                  isDesktop ? 'text-lg' : 'text-base'
                }`}>
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
                  <span className="font-medium">{formatPrice(getTotalPrice(selectedCurrency))}</span>
                </div>
                <div className={`flex justify-between text-gray-600 ${
                  isDesktop ? 'text-lg' : 'text-base'
                }`}>
                  <span>Activación</span>
                  <span className="text-[#299ae4] font-semibold">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className={`flex justify-between font-bold text-gray-900 ${
                    isDesktop ? 'text-2xl' : 'text-xl'
                  }`}>
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice(selectedCurrency))}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-[#299ae4] hover:bg-[#299ae4]/90 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Proceder al Pago
              </Button>

              <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                Activación instantánea • Soporte 24/7 • Garantía de satisfacción
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};