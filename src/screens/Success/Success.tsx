import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';

export const Success: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ¡Pago exitoso!
          </h2>
          <p className="mt-2 text-gray-600">
            Tu compra se ha procesado correctamente. Recibirás un correo de confirmación en breve.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold text-lg"
          >
            <Link to="/">Volver al inicio</Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold text-lg"
          >
            <Link to="/plans">Ver más planes</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};