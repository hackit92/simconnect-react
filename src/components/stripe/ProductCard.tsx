import React, { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import type { StripeProduct } from '../../stripe-config';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';

interface ProductCardProps {
  product: StripeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { createCheckoutSession, loading } = useStripeCheckout();
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);
    try {
      // Navigate to checkout form with product ID
      window.location.href = `/checkout?product=${product.priceId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="mb-6">
          <span className="text-3xl font-bold text-primary">MX$30.00</span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 text-sm ml-1">/mes</span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Comprar ahora'}
        </Button>
      </div>
    </motion.div>
  );
};