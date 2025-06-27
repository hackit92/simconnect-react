import React from 'react';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "./ui/button";
import type { ExternalPlan } from "../lib/api";
import { countryUtils } from '../lib/countries/countryUtils';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';

interface ExternalPlanCardProps {
  plan: ExternalPlan;
  onAddToCart?: (plan: ExternalPlan) => void;
}

// Regional coverage mapping
const regionalCoverage: Record<string, string[]> = {
  'latinoamerica': [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
    'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay', 'Venezuela'
  ],
  'europa': [
    'Alemania', 'Austria', 'Bélgica', 'Bulgaria', 'Croacia', 'Dinamarca', 'Eslovaquia',
    'Eslovenia', 'España', 'Estonia', 'Finlandia', 'Francia', 'Grecia', 'Hungría',
    'Irlanda', 'Italia', 'Letonia', 'Lituania', 'Luxemburgo', 'Países Bajos',
    'Polonia', 'Portugal', 'Reino Unido', 'República Checa', 'Rumanía', 'Suecia', 'Suiza'
  ],
  'norteamerica': ['Estados Unidos', 'Canadá'],
  'asia': [
    'China', 'Japón', 'Corea del Sur', 'India', 'Tailandia', 'Singapur', 'Malasia',
    'Indonesia', 'Filipinas', 'Vietnam', 'Camboya', 'Laos', 'Myanmar', 'Bangladesh', 'Pakistán', 'Sri Lanka'
  ],
  'africa': [
    'Sudáfrica', 'Egipto', 'Marruecos', 'Nigeria', 'Kenia', 'Ghana', 'Etiopía',
    'Tanzania', 'Uganda', 'Zimbabue', 'Zambia', 'Botsuana', 'Namibia'
  ],
  'oriente-medio': [
    'Israel', 'Turquía', 'Emiratos Árabes Unidos', 'Arabia Saudita', 'Qatar',
    'Kuwait', 'Baréin', 'Omán', 'Jordania', 'Líbano'
  ],
  'caribe': [
    'Cuba', 'República Dominicana', 'Jamaica', 'Bahamas', 'Barbados',
    'Trinidad y Tobago', 'Antigua y Barbuda', 'Santa Lucía', 'Granada'
  ],
  'oceania': ['Australia', 'Nueva Zelanda', 'Fiyi', 'Papúa Nueva Guinea', 'Samoa', 'Tonga']
};

// Helper function to get technology icon
function getTechnologyIcon(tech: string): JSX.Element {
  switch (tech) {
    case '5G':
      return (
        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs font-bold flex items-center justify-center">
          5G
        </div>
      );
    case '4G/LTE':
    case '4G':
      return (
        <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
          4G
        </div>
      );
    case '3G':
      return (
        <div className="w-5 h-5 bg-green-500 rounded text-white text-xs font-bold flex items-center justify-center">
          3G
        </div>
      );
    case '2G':
    case '2G/EDGE':
      return (
        <div className="w-5 h-5 bg-gray-500 rounded text-white text-xs font-bold flex items-center justify-center">
          2G
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
          4G
        </div>
      );
  }
}

export const ExternalPlanCard: React.FC<ExternalPlanCardProps> = ({ plan, onAddToCart }) => {
  const { formatPrice } = useCurrency();
  const { isInCart } = useCart();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(plan);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isRegional = plan.plan_type === 'regional';
  const coverageCountries = isRegional && plan.region_code ? 
    (regionalCoverage[plan.region_code] || plan.coverage_countries || []) : [];
  
  const flagClass = isRegional ? 'fi fi-un' : 
    (plan.country_code ? countryUtils.getFlagClass(plan.country_code) : 'fi fi-un');

  const displayName = isRegional ? 
    (plan.region_code ? getRegionDisplayName(plan.region_code) : 'Plan Regional') :
    (plan.country_code ? countryUtils.getCountryName(plan.country_code) : plan.name);

  function getRegionDisplayName(regionCode: string): string {
    const regionNames: Record<string, string> = {
      'latinoamerica': 'Latinoamérica',
      'europa': 'Europa',
      'norteamerica': 'Norteamérica',
      'asia': 'Asia',
      'africa': 'África',
      'oriente-medio': 'Oriente Medio',
      'caribe': 'Caribe',
      'oceania': 'Oceanía',
      'balcanes': 'Balcanes',
      'caucaso': 'Cáucaso',
      'asia-central': 'Asia Central'
    };
    return regionNames[regionCode] || regionCode;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
      {/* Header with Flag and Country/Region */}
      <div className="relative flex items-center justify-between mb-6">
        {/* Block 1: Flag, Name, Technology Icon */}
        <div className="flex items-center space-x-3">
          {/* Flag or Regional Icon */}
          <div className="w-10 h-7 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 border flex-shrink-0">
            {isRegional ? (
              <Globe className="w-6 h-6 text-blue-500" />
            ) : (
              <span 
                className={flagClass} 
                style={{ transform: 'scale(1.5)' }} 
              />
            )}
          </div>
          
          {/* Country/Region Name and Technology Icon */}
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">{displayName}</h3>
            {/* Technology Icon */}
            {getTechnologyIcon(plan.technology)}
          </div>
        </div>
        
        {/* Regional Button - Positioned absolutely to align with card edge */}
        {isRegional && coverageCountries.length > 0 && (
          <button
            onClick={toggleExpanded}
            className="absolute -top-2 -right-2 flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200 shadow-lg z-10"
          >
            <span>Plan Regional</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Block 2: Price with Currency */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(plan.price, plan.currency)}
          </div>
        </div>
      </div>
      
      {/* Regional Coverage Dropdown */}
      {isRegional && isExpanded && coverageCountries.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Cobertura Regional:</h4>
          <div className="grid grid-cols-2 gap-2">
            {coverageCountries.map((country, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>{country}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Plan Details */}
      <div className="flex items-center justify-start mb-6">
        <div className="flex items-center space-x-6">
          {/* Data Amount */}
          {plan.data_gb > 0 && (
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {plan.data_gb < 1 ? `${Math.round(plan.data_gb * 1024)} MB` : `${plan.data_gb} GB`}
              </div>
              <div className="text-xs text-gray-500">Datos</div>
            </div>
          )}
          
          {/* Validity */}
          {plan.validity_days > 0 && (
            <div>
              <div className="text-lg font-semibold text-gray-900">{plan.validity_days} días</div>
              <div className="text-xs text-gray-500">Vigencia</div>
            </div>
          )}
          
          {/* Show plan name if no GB or validity found */}
          {plan.data_gb <= 0 && plan.validity_days <= 0 && (
            <div>
              <div className="text-sm font-medium text-gray-900 max-w-48 truncate">{plan.name}</div>
              <div className="text-xs text-gray-500">Plan</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Purchase Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddToCart}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
            isInCart(plan.id)
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          size="lg"
        >
          {isInCart(plan.id) ? 'AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
        </Button>
      </div>
    </div>
  );
};