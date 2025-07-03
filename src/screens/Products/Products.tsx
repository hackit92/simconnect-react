import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '../../components/stripe/ProductCard';
import { SubscriptionStatus } from '../../components/stripe/SubscriptionStatus';
import { stripeProducts } from '../../stripe-config';

export const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Nuestros Productos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan perfecto para tus necesidades de conectividad móvil.
            </p>
          </div>

          <SubscriptionStatus />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stripeProducts.map((product, index) => (
              <motion.div
                key={product.priceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};