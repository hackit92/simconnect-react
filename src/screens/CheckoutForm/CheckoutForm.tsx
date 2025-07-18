import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, User, Mail, Phone, Globe, Tag, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { countries, type CountryData } from '../../lib/phone-prefixes';
import { stripeProducts } from '../../stripe-config';
import { useIsDesktop } from '../../hooks/useIsDesktop';

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phonePrefix: string;
  phone: string;
}

export const CheckoutForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, getTotalPrice, clearCart } = useCart();
  const { selectedCurrency, formatPrice } = useCurrency();
  const { createCheckoutSession, loading } = useStripeCheckout();
  const [couponCode, setCouponCode] = useState<string>('');
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponExpanded, setIsCouponExpanded] = useState<boolean>(false);
  const isDesktop = useIsDesktop();

  // Get product from URL params for direct purchase
  const productId = searchParams.get('product');
  const directProduct = productId ? stripeProducts.find(p => p.priceId === productId) : null;

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    email: '',
    country: 'MX',
    phonePrefix: '+52',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<BillingDetails>>({});
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    countries.find(c => c.code === 'MX') || countries[0]
  );

  useEffect(() => {
    // If no items in cart and no direct product, redirect to plans
    if (!directProduct && items.length === 0) {
      navigate('/plans');
    }
  }, [directProduct, items, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BillingDetails> = {};

    if (!billingDetails.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!billingDetails.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!billingDetails.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!billingDetails.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{8,15}$/.test(billingDetails.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono debe tener entre 8 y 15 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(t('checkout.coupon_empty'));
      return;
    }
    
    // In a real implementation, you might want to validate the coupon with Stripe
    // before proceeding, but for simplicity we'll just mark it as applied
    setIsCouponApplied(true);
    setCouponError(null);
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    if (isCouponApplied) {
      setIsCouponApplied(false);
    }
    if (couponError) {
      setCouponError(null);
    }
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setBillingDetails(prev => ({
      ...prev,
      country: country.code,
      phonePrefix: country.dialCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous checkout errors 
    setCheckoutError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      let checkoutItems;
      
      if (directProduct) {
        checkoutItems = [{
          priceId: directProduct.priceId,
          quantity: 1
        }];
      } else {
        checkoutItems = items.map(item => {
          // Get price based on selected currency
          let unitAmount = 0;

          switch (selectedCurrency) {
            case 'USD':
              unitAmount = item.regular_price_usd || parseFloat(item.regular_price || '0') || 30;
              break;
            case 'EUR':
              unitAmount = item.regular_price_eur || parseFloat(item.regular_price || '0') || 30;
              break;
            case 'MXN':
              unitAmount = item.regular_price_mxn || parseFloat(item.regular_price || '0') || 30;
              break;
            default:
              unitAmount = item.regular_price_usd || parseFloat(item.regular_price || '0') || 30;
          }

          return {
            priceId: '', // We don't need this when using dynamic pricing
            quantity: item.quantity || 1,
            unitAmount,
            currency: selectedCurrency,
            wcProductId: item.id // Use the actual product ID from cart
          };
        });
      }

      await createCheckoutSession({
        items: checkoutItems,
        mode: directProduct?.mode || 'payment',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/checkout${productId ? `?product=${productId}` : ''}`,
        couponCode: isCouponApplied ? couponCode : undefined,
        billingDetails
      });

      // Clear cart after successful checkout initiation (only for cart purchases)
      if (!directProduct && items.length > 0) {
        clearCart();
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
      setCheckoutError(errorMessage);
    }
  };

  const getTotalAmount = () => {
    if (directProduct) {
      return 30; // MX$30.00 for the recarga product
    }
    return getTotalPrice(selectedCurrency);
  };

  const getItemsToDisplay = () => {
    if (directProduct) {
      return [{
        id: 1,
        name: directProduct.name,
        description: directProduct.description,
        price: 30,
        quantity: 1,
      }];
    }
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.regular_price_usd || parseFloat(item.regular_price || '0'),
      quantity: 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`max-w-7xl mx-auto ${isDesktop ? 'px-6 py-8' : 'px-4 py-6'}`}>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('checkout.back')}
          </button>
          <h1 className={`font-bold text-gray-900 ${isDesktop ? 'text-4xl' : 'text-2xl'}`}>
            {t('checkout.title')}
          </h1>
        </div>

        <div className={`${isDesktop ? 'grid grid-cols-1 lg:grid-cols-2 gap-12' : 'space-y-8'}`}>
          {/* Billing Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6"
          >
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('checkout.billing_info')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.first_name')} *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={billingDetails.firstName}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder={t('checkout.first_name_placeholder')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.last_name')} *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={billingDetails.lastName}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder={t('checkout.last_name_placeholder')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Coupon Code */}
              <details className="group mb-2" open={isCouponExpanded}>
                <summary 
                  className="flex items-center justify-between cursor-pointer text-sm text-primary hover:text-primary/80 py-2 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsCouponExpanded(!isCouponExpanded);
                  }}
                >
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{t('checkout.have_coupon')}</span>
                  </div>
                  {isCouponExpanded ? 
                    <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </summary>
                <div className="pt-3 pb-1">
                  <div className="flex">
                    <input
                      type="text"
                      id="coupon"
                      value={couponCode}
                      onChange={handleCouponChange}
                      disabled={isCouponApplied}
                      className={`flex-1 px-4 py-3 border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                        couponError ? 'border-red-300' : isCouponApplied ? 'border-green-300 bg-green-50' : 'border-gray-200'
                      }`}
                      placeholder={t('checkout.coupon_placeholder')}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isCouponApplied || !couponCode.trim()}
                      className={`px-4 py-3 font-medium text-sm transition-all duration-200 ${
                        isCouponApplied 
                          ? 'bg-green-500 text-white rounded-r-xl'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 rounded-r-xl border border-l-0 border-primary/30'
                      }`}
                    >
                      {isCouponApplied ? (
                        <div className="flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          {t('checkout.coupon_applied')}
                        </div>
                      ) : (
                        t('checkout.apply_coupon')
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1 text-sm text-red-600">{couponError}</p>
                  )}
                  {isCouponApplied && (
                    <p className="mt-1 text-sm text-green-600">{t('checkout.coupon_success')}</p>
                  )}
                </div>
              </details>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {t('checkout.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder={t('checkout.email_placeholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t('checkout.country')} *
                </label>
                <Popover>
                  <PopoverTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-left flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">{selectedCountry.flag}</span>
                      <span>{selectedCountry.name}</span>
                      <span className="ml-2 text-gray-500">({selectedCountry.dialCode})</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2 max-h-60 overflow-y-auto">
                    <div className="space-y-1">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <span className="mr-3 text-lg">{country.flag}</span>
                          <span className="flex-1 text-left">{country.name}</span>
                          <span className="text-gray-500 text-xs">{country.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {t('checkout.phone')} *
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-3 border border-r-0 border-gray-200 rounded-l-xl bg-white">
                    <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className={`flex-1 px-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder={t('checkout.phone_placeholder')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              {checkoutError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">{t('checkout.payment_error')}</p>
                      <p>{checkoutError}</p>
                      {checkoutError.includes('configuración de Stripe') && (
                        <p className="mt-2 text-xs">
                          Contacta al administrador para verificar la configuración de las variables de entorno de Stripe.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                {loading ? t('checkout.processing') : `${t('checkout.pay_button')} ${formatPrice(getTotalAmount(), selectedCurrency)}`}
              </Button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 h-fit"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.order_summary')}</h2>

            <div className="space-y-4 mb-6">
              {getItemsToDisplay().map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(item.price, selectedCurrency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.subtotal')}</span>
                <span>{formatPrice(getTotalAmount(), selectedCurrency)}</span> 
              </div>
              {isCouponApplied && (
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.discount')}</span>
                  <span className="text-green-600">-{formatPrice(0, selectedCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.activation')}</span>
                <span className="text-green-600 font-medium">{t('checkout.free')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>{t('checkout.total')}</span>
                <span>{formatPrice(getTotalAmount(), selectedCurrency)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-primary">
                  <p className="font-medium mb-1">{t('checkout.secure_payment')}</p>
                  <p>{t('checkout.secure_payment_desc')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};