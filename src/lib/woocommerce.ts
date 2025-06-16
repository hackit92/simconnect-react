import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: 'https://simconnect.travel', // Replace with your WooCommerce site URL
  consumerKey: 'ck_54d00b8f4c1de118c4a24cceb61084f4d50fd325',
  consumerSecret: 'cs_de0eaaaa58c521805745943b3ba562c4b6f07010',
  version: 'wc/v3'
});

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{ src: string }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

export const wooCommerceService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await api.get('products/categories');
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getPlans(): Promise<Product[]> {
    try {
      const { data } = await api.get('products');
      return data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  async searchPlans(query?: string, categoryId?: number): Promise<Product[]> {
    try {
      const params: Record<string, string | number> = {};
      
      if (query) {
        params.search = query;
      }
      
      if (categoryId) {
        params.category = categoryId;
      }

      const { data } = await api.get('products', { params });
      return data;
    } catch (error) {
      console.error('Error searching plans:', error);
      throw error;
    }
  },

  async createOrder(productId: number, quantity: number = 1) {
    try {
      const { data } = await api.post('orders', {
        payment_method: 'bacs', // Adjust based on your payment methods
        payment_method_title: 'Direct Bank Transfer',
        set_paid: true,
        line_items: [
          {
            product_id: productId,
            quantity: quantity
          }
        ]
      });
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
};