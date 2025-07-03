export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  wcProductId?: number; // ID del producto en wc_products
  sku?: string; // SKU del producto
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RRIsZLwj7he4JL2nZBc6TMn',
    name: 'Recarga',
    description: 'Recarga',
    mode: 'payment',
    wcProductId: 4658, // ID por defecto
    sku: 'MY-SPN-1GB-07D' // SKU por defecto
  }
];