import { countryCodeMap } from './data';
import type { Country } from './types';

class CountryUtils {
  private cache: Map<string, Country>;

  constructor() {
    this.cache = new Map();
    this.initializeCache();
  }

  private initializeCache(): void {
    Object.entries(countryCodeMap).forEach(([slug, country]) => {
      this.cache.set(slug, country);
      this.cache.set(country.alpha2.toLowerCase(), country);
      this.cache.set(country.alpha3.toLowerCase(), country);
      this.cache.set(country.numeric, country);
    });
  }

  getCountryByCode(code: string): Country | undefined {
    if (!code) return undefined;
    
    const normalizedCode = code.toLowerCase();
    
    // Try direct lookup first
    return this.cache.get(normalizedCode);
  }

  getCountryName(code: string, lang: 'es' | 'en' = 'es'): string {
    const country = this.getCountryByCode(code);
    if (country) {
      return country.name[lang];
    }
    
    // Handle special cases for common country codes/slugs
    const specialCases: Record<string, { es: string; en: string }> = {
      'spain': { es: 'España', en: 'Spain' },
      'espana': { es: 'España', en: 'Spain' },
      'españa': { es: 'España', en: 'Spain' },
      'france': { es: 'Francia', en: 'France' },
      'francia': { es: 'Francia', en: 'France' },
      'germany': { es: 'Alemania', en: 'Germany' },
      'alemania': { es: 'Alemania', en: 'Germany' },
      'italy': { es: 'Italia', en: 'Italy' },
      'italia': { es: 'Italia', en: 'Italy' },
      'united-states': { es: 'Estados Unidos', en: 'United States' },
      'estados-unidos': { es: 'Estados Unidos', en: 'United States' },
      'united-kingdom': { es: 'Reino Unido', en: 'United Kingdom' },
      'reino-unido': { es: 'Reino Unido', en: 'United Kingdom' }
    };
    
    const normalizedCode = code.toLowerCase().trim();
    const specialCase = specialCases[normalizedCode];
    if (specialCase) {
      return specialCase[lang];
    }
    
    // Fallback: format the code nicely
    return code.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getFlagClass(code: string): string {
    if (!code) return 'fi fi-un';
    
    const normalizedCode = code.toLowerCase().trim().replace(/[^a-z-]/g, '');
    
    const specialCases: Record<string, string> = {
      'bel': 'be',
      'ben': 'bj',
      'bes': 'bq',
      'are': 'ae',
      'arg': 'ar',
      'arm': 'am',
      'united-states': 'us',
      'united-kingdom': 'gb',
      'south-korea': 'kr',
      'saudi-arabia': 'sa',
      'andorra': 'ad',
      'antigua-and-barbuda': 'ag',
      'bosnia-and-herzegovina': 'ba',
      'brunei-darussalam': 'bn',
      'cabo-verde': 'cv',
      'central-african-republic': 'cf',
      'congo-democratic-republic': 'cd',
      'congo-republic': 'cg',
      'costa-rica': 'cr',
      'czech-republic': 'cz',
      'dominican-republic': 'do',
      'equatorial-guinea': 'gq',
      'marshall-islands': 'mh',
      'netherlands-antilles': 'bq',
      'new-caledonia': 'nc',
      'new-zealand': 'nz',
      'papua-new-guinea': 'pg',
      'saint-kitts-and-nevis': 'kn',
      'saint-lucia': 'lc',
      'saint-vincent': 'vc',
      'san-marino': 'sm',
      'sao-tome-and-principe': 'st',
      'saudi-arabia': 'sa',
      'sierra-leone': 'sl',
      'solomon-islands': 'sb',
      'south-africa': 'za',
      'sri-lanka': 'lk',
      'timor-leste': 'tl',
      'trinidad-and-tobago': 'tt',
      'united-arab-emirates': 'ae'
    };
    
    // Try special cases first
    const specialCode = specialCases[normalizedCode];
    if (specialCode) {
      return `fi fi-${specialCode}`;
    }
    
    // Try to get country from our data
    const country = this.getCountryByCode(normalizedCode);
    if (country) {
      return `fi fi-${country.alpha2}`;
    }
    
    // For hyphenated codes, take the first part
    if (normalizedCode.includes('-')) {
      const firstPart = normalizedCode.split('-')[0];
      return `fi fi-${firstPart}`;
    }
    
    // Default to first two characters or unknown
    const finalCode = normalizedCode.length >= 2 
      ? normalizedCode.slice(0, 2)
      : 'xx';
    return `fi fi-${finalCode}`;
  }
}

export const countryUtils = new CountryUtils();