import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Supabase Anon Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
  }
);

// Test connection on initialization
supabase.from('wc_categories').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  })
  .catch((err) => {
    console.error('Supabase connection test error:', err);
  });

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{ src: string }>;
  sku: string;
  metadata: {
    gb?: number;
    validity_days?: number;
    technology?: string;
    prices?: Record<string, string>;
    [key: string]: any;
  };
  category_ids: number[];
  // New structured fields
  data_gb?: number;
  validity_days?: number;
  technology?: string;
  has_5g?: boolean;
  has_lte?: boolean;
  regular_price_usd?: number;
  regular_price_eur?: number;
  regular_price_mxn?: number;
  plan_type?: 'country' | 'regional';
  region_code?: string;
  country_code?: string;
  active?: boolean;
  // Additional fields for external API integration
  product_id?: number;
  quantity?: number;
  subtotal?: string;
  total?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
}