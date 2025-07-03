import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CheckoutParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (params: CheckoutParams) => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: params.priceId,
            mode: params.mode,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la sesión de pago');
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