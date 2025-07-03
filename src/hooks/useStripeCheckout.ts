import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phonePrefix: string;
  phone: string;
}

interface CheckoutItem {
  priceId: string;
  quantity: number;
  wcProductId: number;
  sku: string;
}

interface CheckoutParams {
  items: CheckoutItem[];
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  billingDetails?: BillingDetails;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (params: CheckoutParams) => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Only include Authorization header if a session token exists
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            items: params.items,
            mode: params.mode,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            billing_details: params.billingDetails,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe checkout error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        // Provide more specific error messages based on status code
        if (response.status === 500) {
          throw new Error(errorData.error || 'Error interno del servidor. Verifica la configuración de Stripe.');
        } else if (response.status === 401) {
          throw new Error('Error de autenticación. Verifica las credenciales de Stripe.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Datos de pago inválidos.');
        } else {
          throw new Error(errorData.error || `Error al crear la sesión de pago (${response.status})`);
        }
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading };
};