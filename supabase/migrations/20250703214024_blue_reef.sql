/*
  # Allow guest checkout functionality

  1. Changes
    - Allow user_id in stripe_customers to be nullable for guest checkouts
    - Drop unique constraint on user_id to allow multiple guest checkouts
    - Update RLS policies to handle guest customers

  2. Security
    - Maintain data integrity while allowing guest purchases
    - Ensure guest customers can't access other users' data
*/

-- Allow user_id in stripe_customers to be nullable for guest checkouts
ALTER TABLE public.stripe_customers
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint on user_id to allow multiple NULL values for guest checkouts
ALTER TABLE public.stripe_customers
DROP CONSTRAINT IF EXISTS stripe_customers_user_id_key;

-- Update RLS policy for stripe_customers to handle guest customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;

CREATE POLICY "Users can view their own customer data"
    ON public.stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Update RLS policy for stripe_subscriptions to handle guest customers
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
    ON public.stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Update RLS policy for stripe_orders to handle guest customers
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;

CREATE POLICY "Users can view their own order data"
    ON public.stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );