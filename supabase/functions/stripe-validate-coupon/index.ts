import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { coupon_code } = await req.json();

    if (!coupon_code || typeof coupon_code !== 'string' || !coupon_code.trim()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Coupon code is required' 
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    try {
      // Retrieve the promotion code from Stripe
      const promotionCodes = await stripe.promotionCodes.list({
        code: coupon_code.trim(),
        limit: 1
      });
      
      if (promotionCodes.data.length === 0) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Coupon code not found' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      const promotionCode = promotionCodes.data[0];
      const coupon = promotionCode.coupon;
      
      // Check if the promotion code is active
      if (!promotionCode.active) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This promotion code is no longer active' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // Check if the coupon is valid
      if (!coupon.valid) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This coupon is no longer valid' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check if the coupon has expired
      if (promotionCode.expires_at && promotionCode.expires_at < Math.floor(Date.now() / 1000)) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This promotion code has expired' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check if the promotion code has reached its maximum redemptions
      if (promotionCode.max_redemptions && promotionCode.times_redeemed >= promotionCode.max_redemptions) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This promotion code has reached its usage limit' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Promotion code is valid
      return new Response(
        JSON.stringify({ 
          valid: true, 
          coupon: {
            id: promotionCode.code,
            promotion_code_id: promotionCode.id,
            coupon_id: coupon.id,
            name: coupon.name,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
            duration_in_months: coupon.duration_in_months
          }
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (error: any) {
      console.error('Error validating coupon:', error);
      
      if (error.code === 'resource_missing') {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Promotion code not found' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // For other Stripe errors, return a generic message
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Unable to validate coupon. Please try again.' 
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in coupon validation:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});