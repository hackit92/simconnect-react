import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { items, success_url, cancel_url, mode, billing_details, coupon_code } = await req.json();

    // Validate that we have items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return corsResponse({ error: 'Items array is required and must not be empty' }, 400);
    }

    const error = validateParameters(
      { success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      return corsResponse({ error }, 400);
    }

    let user = null;
    const authHeader = req.headers.get('Authorization');

    // Attempt to get user if Authorization header is present
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authenticatedUser }, error: getUserError } = await supabase.auth.getUser(token);
      if (getUserError) {
        console.warn('Failed to authenticate user with provided token, proceeding as guest:', getUserError.message);
        // Do not return 401, proceed as guest
      } else {
        user = authenticatedUser;
      }
    }

    let customerId;

    // If user is authenticated, try to find existing customer
    if (user) {
      const { data: existingCustomer, error: getCustomerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (getCustomerError) {
        console.error('Failed to fetch customer information from the database for authenticated user', getCustomerError);
        return corsResponse({ error: 'Failed to fetch customer information' }, 500);
      }

      if (existingCustomer && existingCustomer.customer_id) {
        customerId = existingCustomer.customer_id;
        // Update existing customer with billing details if provided
        if (billing_details) {
          await stripe.customers.update(customerId, {
            name: `${billing_details.firstName} ${billing_details.lastName}`,
            phone: `${billing_details.phonePrefix}${billing_details.phone}`,
            metadata: {
              phonePrefix: billing_details.phonePrefix,
              countryCode: billing_details.country,
              firstName: billing_details.firstName,
              lastName: billing_details.lastName,
              userId: user.id, // Keep userId in metadata for authenticated users
            },
          });
        }
        console.log(`Using existing Stripe customer ${customerId} for authenticated user ${user.id}`);
      }
    }

    // If no customerId yet (either guest or new authenticated user)
    if (!customerId) {
      const customerData: any = {
        email: billing_details?.email || user?.email, // Use billing email if provided, else user email
        name: billing_details ? `${billing_details.firstName} ${billing_details.lastName}` : user?.email, // Use billing name, else user email
        phone: billing_details ? `${billing_details.phonePrefix}${billing_details.phone}` : null,
        metadata: {
          phonePrefix: billing_details?.phonePrefix || '',
          countryCode: billing_details?.country || '',
          firstName: billing_details?.firstName || '',
          lastName: billing_details?.lastName || '',
        },
      };

      if (user) {
        customerData.metadata.userId = user.id; // Link to user ID in metadata for authenticated users
      }

      const newCustomer = await stripe.customers.create(customerData);
      customerId = newCustomer.id;

      console.log(`Created new Stripe customer ${newCustomer.id} for ${user ? `user ${user.id}` : 'guest'}`);

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user ? user.id : null, // Set user_id to NULL for guest
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);
        // Attempt to clean up Stripe customer if DB insert fails
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to delete Stripe customer after DB insert error:', deleteError);
        }
        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      // Handle subscription record for new customer (if applicable)
      if (mode === 'subscription') {
        const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
          customer_id: newCustomer.id,
          status: 'not_started',
        });

        if (createSubscriptionError) {
          console.error('Failed to save subscription in the database', createSubscriptionError);
          try {
            await stripe.customers.del(newCustomer.id);
          } catch (deleteError) {
            console.error('Failed to delete Stripe customer after subscription creation error:', deleteError);
          }
          return corsResponse({ error: 'Unable to save the subscription in the database' }, 500);
        }
      }
    }

    // Build line items from the items array
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: 'Recarga',
          description: 'Recarga de datos móviles',
          metadata: {
            wc_product_id: item.wcProductId.toString(),
            wc_sku: item.sku,
          },
        },
        unit_amount: 3000, // MX$30.00 in cents
      },
      quantity: item.quantity,
    }));

    // Create Checkout Session
    const sessionData: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items,
      mode,
      success_url,
      cancel_url,
      expand: ['line_items', 'line_items.data.price.product'], // Expand to include product metadata
    };

    // Add coupon if provided
    if (coupon_code) {
      try {
        // Verify the coupon exists and is valid
        const coupon = await stripe.coupons.retrieve(coupon_code);
        
        if (coupon.valid) {
          sessionData.discounts = [{ coupon: coupon.id }];
          console.log(`Applied coupon ${coupon_code} to checkout session`);
        } else {
          console.warn(`Coupon ${coupon_code} is not valid`);
          return corsResponse({ error: 'The provided coupon code is not valid' }, 400);
        }
      } catch (error: any) {
        console.error(`Error retrieving coupon ${coupon_code}:`, error.message);
        
        if (error.code === 'resource_missing') {
          return corsResponse({ error: 'The provided coupon code does not exist' }, 400);
        }
        
        // Don't fail the checkout if coupon validation fails, just log the error
        console.warn(`Proceeding without coupon due to error: ${error.message}`);
      }
    }

    // Always enable phone number collection if billing details are provided
    if (billing_details?.phone) {
      sessionData.phone_number_collection = { enabled: true };
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message || 'An unexpected error occurred during checkout. Please try again.' }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}