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
      // Retrieve the coupon from Stripe
      const coupon = await stripe.coupons.retrieve(coupon_code.trim());
      
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
      if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This coupon has expired' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check if the coupon has reached its maximum redemptions
      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'This coupon has reached its usage limit' 
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Coupon is valid
      return new Response(
        JSON.stringify({ 
          valid: true, 
          coupon: {
            id: coupon.id,
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