import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
); 

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