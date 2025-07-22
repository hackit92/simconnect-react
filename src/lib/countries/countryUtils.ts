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

  iso3ToIso2(iso3Code: string): string | null {
    const iso3ToIso2Map: Record<string, string> = {
      'AUS': 'au', // Australia
      'CHN': 'cn', // China
      'HKG': 'hk', // Hong Kong
      'IDN': 'id', // Indonesia
      'MAC': 'mo', // Macao
      'MYS': 'my', // Malaysia
      'NZL': 'nz', // New Zealand
      'PHL': 'ph', // Philippines
      'SGP': 'sg', // Singapore
      'THA': 'th', // Thailand
      'TWN': 'tw', // Taiwan
      'VNM': 'vn', // Vietnam
      'ARG': 'ar', // Argentina
      'BOL': 'bo', // Bolivia
      'BRA': 'br', // Brazil
      'CHL': 'cl', // Chile
      'COL': 'co', // Colombia
      'CRI': 'cr', // Costa Rica
      'CUB': 'cu', // Cuba
      'ECU': 'ec', // Ecuador
      'SLV': 'sv', // El Salvador
      'GTM': 'gt', // Guatemala
      'HND': 'hn', // Honduras
      'MEX': 'mx', // Mexico
      'NIC': 'ni', // Nicaragua
      'PAN': 'pa', // Panama
      'PRY': 'py', // Paraguay
      'PER': 'pe', // Peru
      'DOM': 'do', // Dominican Republic
      'URY': 'uy', // Uruguay
      'VEN': 've', // Venezuela
      'DEU': 'de', // Germany
      'AUT': 'at', // Austria
      'BEL': 'be', // Belgium
      'BGR': 'bg', // Bulgaria
      'HRV': 'hr', // Croatia
      'DNK': 'dk', // Denmark
      'SVK': 'sk', // Slovakia
      'SVN': 'si', // Slovenia
      'ESP': 'es', // Spain
      'EST': 'ee', // Estonia
      'FIN': 'fi', // Finland
      'FRA': 'fr', // France
      'GRC': 'gr', // Greece
      'HUN': 'hu', // Hungary
      'IRL': 'ie', // Ireland
      'ITA': 'it', // Italy
      'LVA': 'lv', // Latvia
      'LTU': 'lt', // Lithuania
      'LUX': 'lu', // Luxembourg
      'NLD': 'nl', // Netherlands
      'POL': 'pl', // Poland
      'PRT': 'pt', // Portugal
      'GBR': 'gb', // United Kingdom
      'CZE': 'cz', // Czech Republic
      'ROU': 'ro', // Romania
      'SWE': 'se', // Sweden
      'CHE': 'ch', // Switzerland
      'USA': 'us', // United States
      'CAN': 'ca', // Canada
      'SRB': 'rs', // Serbia
      'BIH': 'ba', // Bosnia and Herzegovina
      'MNE': 'me', // Montenegro
      'MKD': 'mk', // North Macedonia
      'ALB': 'al', // Albania
      'XKX': 'xk', // Kosovo
      'ISR': 'il', // Israel
      'TUR': 'tr', // Turkey
      'ARE': 'ae', // United Arab Emirates
      'SAU': 'sa', // Saudi Arabia
      'QAT': 'qa', // Qatar
      'KWT': 'kw', // Kuwait
      'BHR': 'bh', // Bahrain
      'OMN': 'om', // Oman
      'JOR': 'jo', // Jordan
      'LBN': 'lb', // Lebanon
      'JAM': 'jm', // Jamaica
      'BHS': 'bs', // Bahamas
      'BRB': 'bb', // Barbados
      'TTO': 'tt', // Trinidad and Tobago
      'ATG': 'ag', // Antigua and Barbuda
      'LCA': 'lc', // Saint Lucia
      'GRD': 'gd', // Grenada
      'GEO': 'ge', // Georgia
      'ARM': 'am', // Armenia
      'AZE': 'az', // Azerbaijan
      'KAZ': 'kz', // Kazakhstan
      'UZB': 'uz', // Uzbekistan
      'TKM': 'tm', // Turkmenistan
      'TJK': 'tj', // Tajikistan
      'KGZ': 'kg', // Kyrgyzstan
      'JPN': 'jp', // Japan
      'KOR': 'kr', // South Korea
      'IND': 'in', // India
      'BGD': 'bd', // Bangladesh
      'PAK': 'pk', // Pakistan
      'LKA': 'lk', // Sri Lanka
      'KHM': 'kh', // Cambodia
      'LAO': 'la', // Laos
      'MMR': 'mm', // Myanmar
      'ZAF': 'za', // South Africa
      'EGY': 'eg', // Egypt
      'MAR': 'ma', // Morocco
      'NGA': 'ng', // Nigeria
      'KEN': 'ke', // Kenya
      'GHA': 'gh', // Ghana
      'ETH': 'et', // Ethiopia
      'TZA': 'tz', // Tanzania
      'UGA': 'ug', // Uganda
      'ZWE': 'zw', // Zimbabwe
      'ZMB': 'zm', // Zambia
      'BWA': 'bw', // Botswana
      'NAM': 'na', // Namibia
      'FJI': 'fj', // Fiji
      'PNG': 'pg', // Papua New Guinea
      'WSM': 'ws', // Samoa
      'TON': 'to'  // Tonga
    };
    
    return iso3ToIso2Map[iso3Code.toUpperCase()] || null;
  }

  iso2ToIso3(iso2Code: string): string | null {
    const iso2ToIso3Map: Record<string, string> = {
      'au': 'AUS', // Australia
      'cn': 'CHN', // China
      'hk': 'HKG', // Hong Kong
      'id': 'IDN', // Indonesia
      'mo': 'MAC', // Macao
      'my': 'MYS', // Malaysia
      'nz': 'NZL', // New Zealand
      'ph': 'PHL', // Philippines
      'sg': 'SGP', // Singapore
      'th': 'THA', // Thailand
      'tw': 'TWN', // Taiwan
      'vn': 'VNM', // Vietnam
      'ar': 'ARG', // Argentina
      'bo': 'BOL', // Bolivia
      'br': 'BRA', // Brazil
      'cl': 'CHL', // Chile
      'co': 'COL', // Colombia
      'cr': 'CRI', // Costa Rica
      'cu': 'CUB', // Cuba
      'ec': 'ECU', // Ecuador
      'sv': 'SLV', // El Salvador
      'gt': 'GTM', // Guatemala
      'hn': 'HND', // Honduras
      'mx': 'MEX', // Mexico
      'ni': 'NIC', // Nicaragua
      'pa': 'PAN', // Panama
      'py': 'PRY', // Paraguay
      'pe': 'PER', // Peru
      'do': 'DOM', // Dominican Republic
      'uy': 'URY', // Uruguay
      've': 'VEN', // Venezuela
      'de': 'DEU', // Germany
      'at': 'AUT', // Austria
      'be': 'BEL', // Belgium
      'bg': 'BGR', // Bulgaria
      'hr': 'HRV', // Croatia
      'dk': 'DNK', // Denmark
      'sk': 'SVK', // Slovakia
      'si': 'SVN', // Slovenia
      'es': 'ESP', // Spain
      'ee': 'EST', // Estonia
      'fi': 'FIN', // Finland
      'fr': 'FRA', // France
      'gr': 'GRC', // Greece
      'hu': 'HUN', // Hungary
      'ie': 'IRL', // Ireland
      'it': 'ITA', // Italy
      'lv': 'LVA', // Latvia
      'lt': 'LTU', // Lithuania
      'lu': 'LUX', // Luxembourg
      'nl': 'NLD', // Netherlands
      'pl': 'POL', // Poland
      'pt': 'PRT', // Portugal
      'gb': 'GBR', // United Kingdom
      'cz': 'CZE', // Czech Republic
      'ro': 'ROU', // Romania
      'se': 'SWE', // Sweden
      'ch': 'CHE', // Switzerland
      'us': 'USA', // United States
      'ca': 'CAN', // Canada
      'rs': 'SRB', // Serbia
      'ba': 'BIH', // Bosnia and Herzegovina
      'me': 'MNE', // Montenegro
      'mk': 'MKD', // North Macedonia
      'al': 'ALB', // Albania
      'xk': 'XKX', // Kosovo
      'il': 'ISR', // Israel
      'tr': 'TUR', // Turkey
      'ae': 'ARE', // United Arab Emirates
      'sa': 'SAU', // Saudi Arabia
      'qa': 'QAT', // Qatar
      'kw': 'KWT', // Kuwait
      'bh': 'BHR', // Bahrain
      'om': 'OMN', // Oman
      'jo': 'JOR', // Jordan
      'lb': 'LBN', // Lebanon
      'jm': 'JAM', // Jamaica
      'bs': 'BHS', // Bahamas
      'bb': 'BRB', // Barbados
      'tt': 'TTO', // Trinidad and Tobago
      'ag': 'ATG', // Antigua and Barbuda
      'lc': 'LCA', // Saint Lucia
      'gd': 'GRD', // Grenada
      'ge': 'GEO', // Georgia
      'am': 'ARM', // Armenia
      'az': 'AZE', // Azerbaijan
      'kz': 'KAZ', // Kazakhstan
      'uz': 'UZB', // Uzbekistan
      'tm': 'TKM', // Turkmenistan
      'tj': 'TJK', // Tajikistan
      'kg': 'KGZ', // Kyrgyzstan
      'jp': 'JPN', // Japan
      'kr': 'KOR', // South Korea
      'in': 'IND', // India
      'bd': 'BGD', // Bangladesh
      'pk': 'PAK', // Pakistan
      'lk': 'LKA', // Sri Lanka
      'kh': 'KHM', // Cambodia
      'la': 'LAO', // Laos
      'mm': 'MMR', // Myanmar
      'za': 'ZAF', // South Africa
      'eg': 'EGY', // Egypt
      'ma': 'MAR', // Morocco
      'ng': 'NGA', // Nigeria
      'ke': 'KEN', // Kenya
      'gh': 'GHA', // Ghana
      'et': 'ETH', // Ethiopia
      'tz': 'TZA', // Tanzania
      'ug': 'UGA', // Uganda
      'zw': 'ZWE', // Zimbabwe
      'zm': 'ZMB', // Zambia
      'bw': 'BWA', // Botswana
      'na': 'NAM', // Namibia
      'fj': 'FJI', // Fiji
      'pg': 'PNG', // Papua New Guinea
      'ws': 'WSM', // Samoa
      'to': 'TON', // Tonga
      'af': 'AFG', // Afghanistan
      'aw': 'ABW', // Aruba
    };
    
    return iso2ToIso3Map[iso2Code.toLowerCase()] || null;
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