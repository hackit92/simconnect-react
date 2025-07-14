import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  Info,
  Unlock,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useIsDesktop } from '../../hooks/useIsDesktop';

interface CompatibilityResult {
  isCompatible: boolean;
  deviceInfo?: {
    brand: string;
    model: string;
    esimSupport: boolean;
    releaseYear?: number;
  };
  message: string;
}

// Mock database of compatible devices
const compatibleDevices = [
  // iPhone models
  { brand: 'Apple', model: 'iPhone 15', keywords: ['iphone 15', 'iphone15'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Apple', model: 'iPhone 15 Plus', keywords: ['iphone 15 plus', 'iphone15plus'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Apple', model: 'iPhone 15 Pro', keywords: ['iphone 15 pro', 'iphone15pro'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', keywords: ['iphone 15 pro max', 'iphone15promax'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Apple', model: 'iPhone 14', keywords: ['iphone 14', 'iphone14'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Apple', model: 'iPhone 14 Plus', keywords: ['iphone 14 plus', 'iphone14plus'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Apple', model: 'iPhone 14 Pro', keywords: ['iphone 14 pro', 'iphone14pro'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', keywords: ['iphone 14 pro max', 'iphone14promax'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Apple', model: 'iPhone 13', keywords: ['iphone 13', 'iphone13'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Apple', model: 'iPhone 13 Mini', keywords: ['iphone 13 mini', 'iphone13mini'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Apple', model: 'iPhone 13 Pro', keywords: ['iphone 13 pro', 'iphone13pro'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Apple', model: 'iPhone 13 Pro Max', keywords: ['iphone 13 pro max', 'iphone13promax'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Apple', model: 'iPhone 12', keywords: ['iphone 12', 'iphone12'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Apple', model: 'iPhone 12 Mini', keywords: ['iphone 12 mini', 'iphone12mini'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Apple', model: 'iPhone 12 Pro', keywords: ['iphone 12 pro', 'iphone12pro'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Apple', model: 'iPhone 12 Pro Max', keywords: ['iphone 12 pro max', 'iphone12promax'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Apple', model: 'iPhone 11', keywords: ['iphone 11', 'iphone11'], esimSupport: true, releaseYear: 2019 },
  { brand: 'Apple', model: 'iPhone 11 Pro', keywords: ['iphone 11 pro', 'iphone11pro'], esimSupport: true, releaseYear: 2019 },
  { brand: 'Apple', model: 'iPhone 11 Pro Max', keywords: ['iphone 11 pro max', 'iphone11promax'], esimSupport: true, releaseYear: 2019 },
  { brand: 'Apple', model: 'iPhone XS', keywords: ['iphone xs', 'iphonexs'], esimSupport: true, releaseYear: 2018 },
  { brand: 'Apple', model: 'iPhone XS Max', keywords: ['iphone xs max', 'iphonexsmax'], esimSupport: true, releaseYear: 2018 },
  { brand: 'Apple', model: 'iPhone XR', keywords: ['iphone xr', 'iphonexr'], esimSupport: true, releaseYear: 2018 },

  // Samsung Galaxy models
  { brand: 'Samsung', model: 'Galaxy S24', keywords: ['galaxy s24', 'samsung s24', 's24'], esimSupport: true, releaseYear: 2024 },
  { brand: 'Samsung', model: 'Galaxy S24+', keywords: ['galaxy s24+', 'galaxy s24 plus', 'samsung s24+', 's24+'], esimSupport: true, releaseYear: 2024 },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', keywords: ['galaxy s24 ultra', 'samsung s24 ultra', 's24 ultra'], esimSupport: true, releaseYear: 2024 },
  { brand: 'Samsung', model: 'Galaxy S23', keywords: ['galaxy s23', 'samsung s23', 's23'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Samsung', model: 'Galaxy S23+', keywords: ['galaxy s23+', 'galaxy s23 plus', 'samsung s23+', 's23+'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', keywords: ['galaxy s23 ultra', 'samsung s23 ultra', 's23 ultra'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Samsung', model: 'Galaxy S22', keywords: ['galaxy s22', 'samsung s22', 's22'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Samsung', model: 'Galaxy S22+', keywords: ['galaxy s22+', 'galaxy s22 plus', 'samsung s22+', 's22+'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Samsung', model: 'Galaxy S22 Ultra', keywords: ['galaxy s22 ultra', 'samsung s22 ultra', 's22 ultra'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Samsung', model: 'Galaxy S21', keywords: ['galaxy s21', 'samsung s21', 's21'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Samsung', model: 'Galaxy S21+', keywords: ['galaxy s21+', 'galaxy s21 plus', 'samsung s21+', 's21+'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Samsung', model: 'Galaxy S21 Ultra', keywords: ['galaxy s21 ultra', 'samsung s21 ultra', 's21 ultra'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Samsung', model: 'Galaxy S20', keywords: ['galaxy s20', 'samsung s20', 's20'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Samsung', model: 'Galaxy S20+', keywords: ['galaxy s20+', 'galaxy s20 plus', 'samsung s20+', 's20+'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Samsung', model: 'Galaxy S20 Ultra', keywords: ['galaxy s20 ultra', 'samsung s20 ultra', 's20 ultra'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Samsung', model: 'Galaxy Note 20', keywords: ['galaxy note 20', 'samsung note 20', 'note 20'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Samsung', model: 'Galaxy Note 20 Ultra', keywords: ['galaxy note 20 ultra', 'samsung note 20 ultra', 'note 20 ultra'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', keywords: ['galaxy z fold 5', 'samsung z fold 5', 'z fold 5'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', keywords: ['galaxy z flip 5', 'samsung z flip 5', 'z flip 5'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Samsung', model: 'Galaxy Z Fold 4', keywords: ['galaxy z fold 4', 'samsung z fold 4', 'z fold 4'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Samsung', model: 'Galaxy Z Flip 4', keywords: ['galaxy z flip 4', 'samsung z flip 4', 'z flip 4'], esimSupport: true, releaseYear: 2022 },

  // Google Pixel models
  { brand: 'Google', model: 'Pixel 8', keywords: ['pixel 8', 'google pixel 8'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Google', model: 'Pixel 8 Pro', keywords: ['pixel 8 pro', 'google pixel 8 pro'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Google', model: 'Pixel 7', keywords: ['pixel 7', 'google pixel 7'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Google', model: 'Pixel 7 Pro', keywords: ['pixel 7 pro', 'google pixel 7 pro'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Google', model: 'Pixel 6', keywords: ['pixel 6', 'google pixel 6'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Google', model: 'Pixel 6 Pro', keywords: ['pixel 6 pro', 'google pixel 6 pro'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Google', model: 'Pixel 5', keywords: ['pixel 5', 'google pixel 5'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Google', model: 'Pixel 4', keywords: ['pixel 4', 'google pixel 4'], esimSupport: true, releaseYear: 2019 },
  { brand: 'Google', model: 'Pixel 4 XL', keywords: ['pixel 4 xl', 'google pixel 4 xl'], esimSupport: true, releaseYear: 2019 },

  // OnePlus models
  { brand: 'OnePlus', model: 'OnePlus 12', keywords: ['oneplus 12', '1+ 12'], esimSupport: true, releaseYear: 2024 },
  { brand: 'OnePlus', model: 'OnePlus 11', keywords: ['oneplus 11', '1+ 11'], esimSupport: true, releaseYear: 2023 },
  { brand: 'OnePlus', model: 'OnePlus 10 Pro', keywords: ['oneplus 10 pro', '1+ 10 pro'], esimSupport: true, releaseYear: 2022 },
  { brand: 'OnePlus', model: 'OnePlus 9', keywords: ['oneplus 9', '1+ 9'], esimSupport: true, releaseYear: 2021 },
  { brand: 'OnePlus', model: 'OnePlus 9 Pro', keywords: ['oneplus 9 pro', '1+ 9 pro'], esimSupport: true, releaseYear: 2021 },

  // Xiaomi models
  { brand: 'Xiaomi', model: 'Xiaomi 14', keywords: ['xiaomi 14', 'mi 14'], esimSupport: true, releaseYear: 2024 },
  { brand: 'Xiaomi', model: 'Xiaomi 13', keywords: ['xiaomi 13', 'mi 13'], esimSupport: true, releaseYear: 2023 },
  { brand: 'Xiaomi', model: 'Xiaomi 12', keywords: ['xiaomi 12', 'mi 12'], esimSupport: true, releaseYear: 2022 },
  { brand: 'Xiaomi', model: 'Xiaomi 11', keywords: ['xiaomi 11', 'mi 11'], esimSupport: true, releaseYear: 2021 },

  // Huawei models (limited eSIM support)
  { brand: 'Huawei', model: 'P50 Pro', keywords: ['huawei p50 pro', 'p50 pro'], esimSupport: true, releaseYear: 2021 },
  { brand: 'Huawei', model: 'P40 Pro', keywords: ['huawei p40 pro', 'p40 pro'], esimSupport: true, releaseYear: 2020 },
  { brand: 'Huawei', model: 'Mate 40 Pro', keywords: ['huawei mate 40 pro', 'mate 40 pro'], esimSupport: true, releaseYear: 2020 },
];

interface CompatibilityCheckerProps {
  isEmbedded?: boolean;
}

export const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({ isEmbedded = false }) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deviceInput, setDeviceInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Check for device parameter on load (for standalone page)
  React.useEffect(() => {
    if (!isEmbedded) {
      const deviceParam = searchParams.get('device');
      if (deviceParam) {
        setDeviceInput(deviceParam);
        checkCompatibility(deviceParam);
      }
    }
  }, [searchParams, isEmbedded]);

  const checkCompatibility = async (deviceToCheck?: string) => {
    const device = deviceToCheck || deviceInput.trim();
    if (!device) return;

    // If embedded, navigate to standalone page with device parameter
    if (isEmbedded) {
      navigate(`/compatibility?device=${encodeURIComponent(device)}`);
      return;
    }

    setIsChecking(true);
    setShowResult(false);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const normalizedInput = device.toLowerCase().trim();
    
    // Find matching device
    const matchedDevice = compatibleDevices.find(device =>
      device.keywords.some(keyword => 
        normalizedInput.includes(keyword) || keyword.includes(normalizedInput)
      )
    );

    let compatibilityResult: CompatibilityResult;

    if (matchedDevice) {
      compatibilityResult = {
        isCompatible: matchedDevice.esimSupport,
        deviceInfo: matchedDevice,
        message: matchedDevice.esimSupport 
          ? t('compatibility.compatible_message')
          : t('compatibility.not_compatible_message')
      };
    } else {
      // Device not found in database
      compatibilityResult = {
        isCompatible: false,
        message: t('compatibility.device_not_found')
      };
    }

    setResult(compatibilityResult);
    setIsChecking(false);
    setShowResult(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceInput(e.target.value);
    if (showResult) {
      setShowResult(false);
      setResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkCompatibility();
    }
  };

  // Embedded layout for home page
  if (isEmbedded) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${
            isDesktop 
              ? 'grid grid-cols-2 gap-16 items-center' 
              : 'space-y-8'
          }`}>
            {/* Left Column - Title and Description */}
            <div className={`${isDesktop ? 'text-left' : 'text-center'}`}>
              <h2 className={`font-light text-gray-800 mb-4 ${
                isDesktop ? 'text-5xl' : 'text-3xl'
              }`}>
                Compatibilidad de <span className="text-[#299ae4] font-normal">mi</span><br />
                <span className="text-[#299ae4] font-normal">Dispositivo</span>
              </h2>
              <p className={`text-gray-600 ${
                isDesktop ? 'text-lg max-w-lg' : 'text-base'
              }`}>
                Verifica si tu dispositivo es compatible antes de comprar el servicio
              </p>
            </div>

            {/* Right Column - Compatibility Checker */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative">
              <h3 className="text-2xl font-semibold text-[#299ae4] text-center mb-6">
                Verificador de Compatibilidad eSIM
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="device-input-embedded" className="block text-base font-medium text-gray-900 mb-3">
                    Ingresa tu dispositivo:
                  </label>
                  <input
                    id="device-input-embedded"
                    type="text"
                    value={deviceInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ej: iPhone 13, Samsung Galaxy S22..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#299ae4]/30 focus:border-[#299ae4] transition-all duration-200 text-base"
                  />
                </div>

                <button
                  onClick={() => checkCompatibility()}
                  disabled={!deviceInput.trim()}
                  className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  VERIFICAR COMPATIBILIDAD
                </button>

                <div className="bg-gray-100 rounded-xl p-3 mt-4">
                  <p className="text-sm text-gray-600 text-center italic">
                    * Verifica si tu dispositivo es compatible con tecnología eSIM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Standalone page layout (existing functionality)
  return (
    <div className={`${isEmbedded ? 'bg-gray-50' : 'min-h-screen bg-gray-50'}`}>
      <div className={`${
        isEmbedded 
          ? 'max-w-7xl mx-auto px-8 py-16' 
          : `max-w-4xl mx-auto ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`
      }`}>
        {/* Header */}
        <div className={`${isEmbedded ? 'mb-12' : 'mb-8'}`}>
          {!isDesktop && !isEmbedded && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </button>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${isEmbedded ? 'text-center' : 'text-center'}`}
          >
            <div className={`flex justify-center ${isEmbedded ? 'mb-8' : 'mb-6'}`}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className={`font-bold text-gray-900 mb-4 ${
              isEmbedded ? 'text-4xl' : isDesktop ? 'text-4xl' : 'text-2xl'
            }`}>
              {t('compatibility.title')}
            </h1>
            <p className={`text-gray-600 max-w-3xl mx-auto ${
              isEmbedded ? 'text-xl' : isDesktop ? 'text-lg' : 'text-base'
            }`}>
              {t('compatibility.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className={`${
          isEmbedded 
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-start' 
            : 'max-w-2xl mx-auto'
        }`}>
          {/* Device Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${
              isEmbedded ? 'p-8' : 'p-8 mb-8'
            }`}
          >
            <div className={`${isEmbedded ? 'mb-8' : 'mb-6'}`}>
              <label htmlFor="device-input" className="block text-lg font-semibold text-gray-900 mb-3">
                {t('compatibility.device_input_label')}
              </label>
              <div className="relative">
                <input
                  id="device-input"
                  type="text"
                  value={deviceInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={t('compatibility.device_input_placeholder')}
                  className={`w-full px-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 ${
                    isEmbedded ? 'py-4 text-lg' : 'py-4 text-lg'
                  }`}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <Button
              onClick={checkCompatibility}
              disabled={!deviceInput.trim() || isChecking}
              className={`w-full bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${
                isEmbedded ? 'py-4 text-lg' : 'py-4 text-lg'
              }`}
            >
              {isChecking ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  {t('compatibility.checking')}
                </div>
              ) : (
                t('compatibility.check_button')
              )}
            </Button>
          </motion.div>

          {/* Results and Information Section */}
          <div className="space-y-8">
            {/* Results Section */}
            <AnimatePresence>
              {showResult && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-white rounded-2xl p-8 shadow-lg border-2 mb-8 ${
                    result.isCompatible 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {result.isCompatible ? (
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      ) : (
                        <XCircle className="w-12 h-12 text-red-600" />
                      )}
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-3 ${
                      result.isCompatible ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.isCompatible 
                        ? t('compatibility.compatible_title') 
                        : t('compatibility.not_compatible_title')
                      }
                    </h3>

                    {result.deviceInfo && (
                      <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{t('compatibility.device_info')}</h4>
                        <div className="text-left space-y-1">
                          <p><span className="font-medium">{t('compatibility.brand')}:</span> {result.deviceInfo.brand}</p>
                          <p><span className="font-medium">{t('compatibility.model')}:</span> {result.deviceInfo.model}</p>
                          {result.deviceInfo.releaseYear && (
                            <p><span className="font-medium">{t('compatibility.release_year')}:</span> {result.deviceInfo.releaseYear}</p>
                          )}
                          <p><span className="font-medium">{t('compatibility.esim_support')}:</span> 
                            <span className={`ml-2 ${result.deviceInfo.esimSupport ? 'text-green-600' : 'text-red-600'}`}>
                              {result.deviceInfo.esimSupport ? t('common.yes') : t('common.no')}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    <p className={`text-lg ${
                      result.isCompatible ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unlock Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Unlock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">
                    {t('compatibility.unlock_reminder_title')}
                  </h4>
                  <p className="text-amber-700 leading-relaxed">
                    {t('compatibility.unlock_reminder_message')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600 mt-1" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">
                    {t('compatibility.additional_info_title')}
                  </h4>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('compatibility.info_1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('compatibility.info_2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('compatibility.info_3')}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            {showResult && result?.isCompatible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <Button
                  onClick={() => navigate('/plans')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t('compatibility.explore_plans')}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};