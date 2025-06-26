import { useTranslation } from 'react-i18next';
import { countryUtils } from '../lib/countries/countryUtils';

export const useCountryName = () => {
  const { i18n } = useTranslation();
  
  const getCountryName = (code: string): string => {
    const lang = i18n.language === 'en' ? 'en' : 'es';
    return countryUtils.getCountryName(code, lang);
  };
  
  return { getCountryName };
};