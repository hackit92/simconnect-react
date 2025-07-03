import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { stripeProducts } from '../../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return null;
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id);
  const productName = product?.name || 'Plan desconocido';

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'trialing':
        return 'En prueba';
      case 'past_due':
        return 'Pago pendiente';
      case 'canceled':
        return 'Cancelado';
      case 'unpaid':
        return 'Sin pagar';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'past_due':
      case 'unpaid':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'canceled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de suscripción</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan actual:</span>
          <span className="font-medium text-gray-900">{productName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Estado:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.subscription_status)}`}>
            {getStatusText(subscription.subscription_status)}
          </span>
        </div>
        
        {subscription.current_period_end && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {subscription.cancel_at_period_end ? 'Termina el:' : 'Renueva el:'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}
        
        {subscription.cancel_at_period_end && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Tu suscripción se cancelará al final del período actual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};