export interface Country {
  name: {
    es: string;
    en: string;
  };
  alpha2: string;
  alpha3: string;
  numeric: string;
}

export interface CountryUtils {
  getCountryByCode(code: string): Country | undefined;
  getCountryName(code: string, lang?: 'es' | 'en'): string;
  getFlagClass(code: string): string;
}