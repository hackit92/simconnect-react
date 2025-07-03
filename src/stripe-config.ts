export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RRIsZLwj7he4JL2nZBc6TMn',
    name: 'Recarga',
    description: 'Recarga',
    mode: 'payment'
  }
];