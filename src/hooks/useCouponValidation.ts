import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    name: string | null;
    percent_off: number | null;
    amount_off: number | null;
    currency: string | null;
    duration: string;
    duration_in_months: number | null;
  };
}

export const useCouponValidation = () => {
  const [loading, setLoading] = useState(false);

  const validateCoupon = async (couponCode: string): Promise<CouponValidationResult> => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-validate-coupon`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            coupon_code: couponCode
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error validating coupon');
      }

      return result;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Error validating coupon'
      };
    } finally {
      setLoading(false);
    }
  };

  return { validateCoupon, loading };
};