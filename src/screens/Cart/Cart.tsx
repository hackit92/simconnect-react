import React from "react";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useCart } from "../../contexts/CartContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import { countryUtils } from "../../lib/countries/countryUtils";

export const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { selectedCurrency, formatPrice } = useCurrency();

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

  const getDisplayName = (item: any) => {
    if (item.plan_type === 'regional') {
      const regionNames: Record<string, string> = {
        'latinoamerica': 'Latinoamérica',
        'europa': 'Europa',
        'norteamerica': 'Norteamérica',
        'balcanes': 'Balcanes',
        'oriente-medio': 'Oriente Medio',
        'caribe': 'Caribe',
        'caucaso': 'Cáucaso',
        'asia-central': 'Asia Central',
        'asia': 'Asia',
        'africa': 'África',
        'oceania': 'Oceanía'
      };
      return regionNames[item.region_code || ''] || 'Plan Regional';
    }
    
    if (item.country_code) {
      return countryUtils.getCountryName(item.country_code);
    }
    
    return 'Plan Internacional';
  };

  if (items.length === 0) {
    return (
      <CardContent className="flex flex-col items-center px-6 py-12 relative self-stretch w-full min-h-[600px] justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6 max-w-sm">
            Explora nuestros planes de datos móviles y encuentra el perfecto para tu próximo viaje.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Explorar Planes
          </Button>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex flex-col px-0 py-0 relative self-stretch w-full min-h-screen bg-white">
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
            <Button
              onClick={clearCart}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vaciar
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 px-6 py-6">
          <div className="space-y-4 mb-8">
            {items.map((item) => {
              const price = getProductPrice(item);
              const displayName = getDisplayName(item);
              const subtotal = price * item.quantity;

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {displayName}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        {item.data_gb && (
                          <span>
                            {item.data_gb < 1 ? `${Math.round(item.data_gb * 1024)} MB` : `${item.data_gb} GB`}
                          </span>
                        )}
                        {item.validity_days && (
                          <span>{item.validity_days} días</span>
                        )}
                        {item.technology && (
                          <span>{item.technology}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Cantidad:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(subtotal)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {formatPrice(price)} cada uno
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
                <span>{formatPrice(getTotalPrice(selectedCurrency))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Activación</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice(selectedCurrency))}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceder al Pago
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Activación instantánea • Soporte 24/7 • Garantía de satisfacción
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  );
};