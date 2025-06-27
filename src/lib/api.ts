export interface ExternalPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  data_gb: number;
  validity_days: number;
  technology: string;
  has_5g: boolean;
  has_lte: boolean;
  plan_type: 'country' | 'regional';
  region_code?: string;
  country_code?: string;
  coverage_countries?: string[];
  active: boolean;
  sku: string;
  images?: Array<{ src: string }>;
  metadata?: Record<string, any>;
}

export interface ExternalCategory {
  id: number;
  name: string;
  slug: string;
  parent?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ExternalApiService {
  private baseUrl = 'https://api-iot.ucc.systems/api';

  async getPlans(): Promise<ExternalPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/plans/public/yes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return this.transformPlans(data);
      } else if (data.data && Array.isArray(data.data)) {
        return this.transformPlans(data.data);
      } else if (data.plans && Array.isArray(data.plans)) {
        return this.transformPlans(data.plans);
      } else {
        console.warn('Unexpected API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching plans from external API:', error);
      throw error;
    }
  }

  async getCategories(): Promise<ExternalCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/public/yes`);
      
      if (!response.ok) {
        // If categories endpoint doesn't exist, extract from plans
        const plans = await this.getPlans();
        return this.extractCategoriesFromPlans(plans);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return this.transformCategories(data);
      } else if (data.data && Array.isArray(data.data)) {
        return this.transformCategories(data.data);
      } else {
        // Fallback: extract from plans
        const plans = await this.getPlans();
        return this.extractCategoriesFromPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching categories, extracting from plans:', error);
      // Fallback: extract categories from plans
      try {
        const plans = await this.getPlans();
        return this.extractCategoriesFromPlans(plans);
      } catch (planError) {
        console.error('Error extracting categories from plans:', planError);
        return [];
      }
    }
  }

  private transformPlans(rawPlans: any[]): ExternalPlan[] {
    return rawPlans.map(plan => ({
      id: plan.id || Math.random(),
      name: plan.name || plan.title || 'Plan sin nombre',
      description: plan.description || '',
      price: this.parsePrice(plan.price || plan.regular_price || 0),
      currency: plan.currency || 'USD',
      data_gb: this.parseDataAmount(plan.data_gb || plan.gb || plan.data || 0),
      validity_days: parseInt(plan.validity_days || plan.days || plan.validity || 30),
      technology: plan.technology || '4G',
      has_5g: Boolean(plan.has_5g || plan.technology?.includes('5G')),
      has_lte: Boolean(plan.has_lte !== false), // Default to true unless explicitly false
      plan_type: this.determinePlanType(plan),
      region_code: plan.region_code || plan.region,
      country_code: plan.country_code || plan.country,
      coverage_countries: plan.coverage_countries || plan.countries || [],
      active: plan.active !== false, // Default to true unless explicitly false
      sku: plan.sku || `plan-${plan.id}`,
      images: plan.images || [],
      metadata: plan.metadata || {}
    }));
  }

  private transformCategories(rawCategories: any[]): ExternalCategory[] {
    return rawCategories.map(category => ({
      id: category.id || Math.random(),
      name: category.name || 'Categoría sin nombre',
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'categoria',
      parent: category.parent || undefined
    }));
  }

  private extractCategoriesFromPlans(plans: ExternalPlan[]): ExternalCategory[] {
    const categories = new Map<string, ExternalCategory>();
    let categoryId = 1;

    plans.forEach(plan => {
      // Extract country categories
      if (plan.plan_type === 'country' && plan.country_code) {
        const slug = plan.country_code;
        if (!categories.has(slug)) {
          categories.set(slug, {
            id: categoryId++,
            name: this.getCountryName(plan.country_code),
            slug: slug,
          });
        }
      }

      // Extract region categories
      if (plan.plan_type === 'regional' && plan.region_code) {
        const slug = plan.region_code;
        if (!categories.has(slug)) {
          categories.set(slug, {
            id: categoryId++,
            name: this.getRegionName(plan.region_code),
            slug: slug,
          });
        }
      }
    });

    return Array.from(categories.values());
  }

  private parsePrice(price: any): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      return isNaN(numericPrice) ? 0 : numericPrice;
    }
    return 0;
  }

  private parseDataAmount(data: any): number {
    if (typeof data === 'number') return data;
    if (typeof data === 'string') {
      const numericData = parseFloat(data.replace(/[^0-9.]/g, ''));
      return isNaN(numericData) ? 0 : numericData;
    }
    return 0;
  }

  private determinePlanType(plan: any): 'country' | 'regional' {
    if (plan.plan_type) return plan.plan_type;
    if (plan.region_code || plan.region) return 'regional';
    if (plan.country_code || plan.country) return 'country';
    
    // Analyze plan name for regional indicators
    const name = (plan.name || '').toLowerCase();
    const regionalKeywords = [
      'europa', 'europe', 'latinoamerica', 'latin america', 'asia', 'africa',
      'oriente medio', 'middle east', 'caribe', 'caribbean', 'regional'
    ];
    
    if (regionalKeywords.some(keyword => name.includes(keyword))) {
      return 'regional';
    }
    
    return 'country';
  }

  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      'us': 'Estados Unidos',
      'es': 'España',
      'fr': 'Francia',
      'de': 'Alemania',
      'it': 'Italia',
      'gb': 'Reino Unido',
      'mx': 'México',
      'br': 'Brasil',
      'ar': 'Argentina',
      'cl': 'Chile',
      'co': 'Colombia',
      'pe': 'Perú',
      've': 'Venezuela',
      'ca': 'Canadá',
      'au': 'Australia',
      'jp': 'Japón',
      'cn': 'China',
      'kr': 'Corea del Sur',
      'in': 'India',
      'th': 'Tailandia',
      'sg': 'Singapur',
      'my': 'Malasia',
      'id': 'Indonesia',
      'ph': 'Filipinas',
      'vn': 'Vietnam',
      'tr': 'Turquía',
      'il': 'Israel',
      'ae': 'Emiratos Árabes Unidos',
      'sa': 'Arabia Saudita',
      'za': 'Sudáfrica',
      'eg': 'Egipto',
      'ma': 'Marruecos',
      'ng': 'Nigeria',
      'ke': 'Kenia',
      'gh': 'Ghana',
      'nz': 'Nueva Zelanda',
      'fj': 'Fiyi'
    };
    
    return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
  }

  private getRegionName(regionCode: string): string {
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

  // Search and filter methods
  async searchPlans(query: string): Promise<ExternalPlan[]> {
    const allPlans = await this.getPlans();
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) return allPlans;
    
    return allPlans.filter(plan => 
      plan.name.toLowerCase().includes(normalizedQuery) ||
      plan.description?.toLowerCase().includes(normalizedQuery) ||
      plan.country_code?.toLowerCase().includes(normalizedQuery) ||
      plan.region_code?.toLowerCase().includes(normalizedQuery)
    );
  }

  async getPlansByCountry(countryCode: string): Promise<ExternalPlan[]> {
    const allPlans = await this.getPlans();
    return allPlans.filter(plan => 
      plan.plan_type === 'country' && 
      plan.country_code?.toLowerCase() === countryCode.toLowerCase()
    );
  }

  async getPlansByRegion(regionCode: string): Promise<ExternalPlan[]> {
    const allPlans = await this.getPlans();
    return allPlans.filter(plan => 
      plan.plan_type === 'regional' && 
      plan.region_code?.toLowerCase() === regionCode.toLowerCase()
    );
  }
}

export const externalApiService = new ExternalApiService();