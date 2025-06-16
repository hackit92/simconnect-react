import { countryUtils } from '../countries/countryUtils';
import type { Category } from '../supabase';

// Función para calcular la distancia de Levenshtein (similitud entre strings)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Función para calcular similitud (0-1, donde 1 es idéntico)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
}

// Función para normalizar texto (remover acentos, espacios extra, etc.)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

// Mapeo de regiones a países
const regionMapping: Record<string, string[]> = {
  'europa': ['spain', 'france', 'germany', 'italy', 'netherlands', 'portugal', 'greece', 'switzerland', 'austria', 'belgium', 'denmark', 'finland', 'ireland', 'norway', 'sweden', 'united-kingdom', 'poland', 'czechia', 'hungary', 'romania', 'bulgaria', 'croatia', 'slovenia', 'slovakia', 'lithuania', 'latvia', 'estonia'],
  'europe': ['spain', 'france', 'germany', 'italy', 'netherlands', 'portugal', 'greece', 'switzerland', 'austria', 'belgium', 'denmark', 'finland', 'ireland', 'norway', 'sweden', 'united-kingdom', 'poland', 'czechia', 'hungary', 'romania', 'bulgaria', 'croatia', 'slovenia', 'slovakia', 'lithuania', 'latvia', 'estonia'],
  'latinoamerica': ['mexico', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela', 'ecuador', 'bolivia', 'paraguay', 'uruguay', 'costa-rica', 'panama', 'guatemala', 'honduras', 'el-salvador', 'nicaragua', 'cuba', 'dominican-republic'],
  'latin america': ['mexico', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela', 'ecuador', 'bolivia', 'paraguay', 'uruguay', 'costa-rica', 'panama', 'guatemala', 'honduras', 'el-salvador', 'nicaragua', 'cuba', 'dominican-republic'],
  'america latina': ['mexico', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela', 'ecuador', 'bolivia', 'paraguay', 'uruguay', 'costa-rica', 'panama', 'guatemala', 'honduras', 'el-salvador', 'nicaragua', 'cuba', 'dominican-republic'],
  'norteamerica': ['united-states', 'canada'],
  'north america': ['united-states', 'canada'],
  'america del norte': ['united-states', 'canada'],
  'asia': ['china', 'japan', 'south-korea', 'india', 'thailand', 'singapore', 'malaysia', 'indonesia', 'philippines', 'vietnam', 'cambodia', 'laos', 'myanmar', 'bangladesh', 'pakistan', 'sri-lanka'],
  'africa': ['south-africa', 'egypt', 'morocco', 'nigeria', 'kenya', 'ghana', 'ethiopia', 'tanzania', 'uganda', 'zimbabwe', 'zambia', 'botswana', 'namibia'],
  'caribe': ['cuba', 'dominican-republic', 'jamaica', 'bahamas', 'barbados', 'trinidad-and-tobago', 'antigua-and-barbuda', 'saint-lucia', 'grenada', 'saint-vincent-grenadines'],
  'caribbean': ['cuba', 'dominican-republic', 'jamaica', 'bahamas', 'barbados', 'trinidad-and-tobago', 'antigua-and-barbuda', 'saint-lucia', 'grenada', 'saint-vincent-grenadines'],
  'oriente medio': ['israel', 'turkey', 'united-arab-emirates', 'saudi-arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan', 'lebanon'],
  'middle east': ['israel', 'turkey', 'united-arab-emirates', 'saudi-arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan', 'lebanon'],
  'oceania': ['australia', 'new-zealand', 'fiji', 'papua-new-guinea', 'samoa', 'tonga', 'vanuatu', 'solomon-islands']
};

// Sinónimos y variaciones de nombres de países
const countryAliases: Record<string, string[]> = {
  'united-states': ['usa', 'estados unidos', 'america', 'eeuu', 'us', 'united states of america'],
  'united-kingdom': ['uk', 'reino unido', 'gran bretana', 'inglaterra', 'britain', 'great britain', 'england'],
  'south-korea': ['corea del sur', 'korea', 'corea'],
  'north-korea': ['corea del norte', 'korea del norte'],
  'germany': ['alemania', 'deutschland'],
  'spain': ['españa', 'espana'],
  'france': ['francia'],
  'italy': ['italia'],
  'netherlands': ['holanda', 'paises bajos', 'holland'],
  'switzerland': ['suiza'],
  'austria': ['austria'],
  'belgium': ['belgica'],
  'portugal': ['portugal'],
  'greece': ['grecia'],
  'russia': ['rusia'],
  'china': ['china'],
  'japan': ['japon'],
  'brazil': ['brasil'],
  'mexico': ['mejico'],
  'argentina': ['argentina'],
  'chile': ['chile'],
  'colombia': ['colombia'],
  'peru': ['peru'],
  'venezuela': ['venezuela'],
  'canada': ['canada'],
  'australia': ['australia'],
  'new-zealand': ['nueva zelanda', 'nueva zelandia'],
  'south-africa': ['sudafrica', 'africa del sur'],
  'saudi-arabia': ['arabia saudita', 'arabia saudi'],
  'united-arab-emirates': ['emiratos arabes unidos', 'emiratos', 'uae'],
  'czech-republic': ['republica checa', 'chequia'],
  'dominican-republic': ['republica dominicana'],
  'costa-rica': ['costa rica'],
  'el-salvador': ['el salvador'],
  'sri-lanka': ['sri lanka'],
  'papua-new-guinea': ['papua nueva guinea']
};

interface SearchResult {
  category: Category;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'region' | 'alias';
  matchedTerm: string;
}

export class IntelligentSearch {
  private categories: Category[] = [];

  constructor(categories: Category[]) {
    this.categories = categories;
  }

  // Función principal de búsqueda
  search(query: string, threshold: number = 0.3): Category[] {
    if (!query || query.trim().length < 2) {
      return this.categories;
    }

    const normalizedQuery = normalizeText(query);
    const results: SearchResult[] = [];

    // 1. Búsqueda por región
    const regionResults = this.searchByRegion(normalizedQuery);
    results.push(...regionResults);

    // 2. Búsqueda en cada categoría
    for (const category of this.categories) {
      const categoryResults = this.searchInCategory(category, normalizedQuery);
      results.push(...categoryResults);
    }

    // 3. Filtrar duplicados y ordenar por score
    const uniqueResults = this.removeDuplicates(results);
    const filteredResults = uniqueResults.filter(result => result.score >= threshold);
    const sortedResults = filteredResults.sort((a, b) => b.score - a.score);

    return sortedResults.map(result => result.category);
  }

  private searchByRegion(query: string): SearchResult[] {
    const results: SearchResult[] = [];

    for (const [regionName, countrySlugs] of Object.entries(regionMapping)) {
      const similarity = calculateSimilarity(query, normalizeText(regionName));
      
      if (similarity >= 0.7) {
        // Encontrar categorías que coincidan con los países de esta región
        for (const countrySlug of countrySlugs) {
          const category = this.categories.find(cat => 
            normalizeText(cat.slug) === normalizeText(countrySlug)
          );
          
          if (category) {
            results.push({
              category,
              score: similarity * 0.9, // Penalizar ligeramente las búsquedas por región
              matchType: 'region',
              matchedTerm: regionName
            });
          }
        }
      }
    }

    return results;
  }

  private searchInCategory(category: Category, query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const countryNameEs = countryUtils.getCountryName(category.slug, 'es');
    const countryNameEn = countryUtils.getCountryName(category.slug, 'en');

    // 1. Búsqueda exacta en slug
    if (normalizeText(category.slug).includes(query)) {
      results.push({
        category,
        score: 1.0,
        matchType: 'exact',
        matchedTerm: category.slug
      });
    }

    // 2. Búsqueda exacta en nombres
    if (normalizeText(countryNameEs).includes(query)) {
      results.push({
        category,
        score: 0.95,
        matchType: 'exact',
        matchedTerm: countryNameEs
      });
    }

    if (normalizeText(countryNameEn).includes(query)) {
      results.push({
        category,
        score: 0.95,
        matchType: 'exact',
        matchedTerm: countryNameEn
      });
    }

    // 3. Búsqueda en aliases
    const aliases = countryAliases[category.slug] || [];
    for (const alias of aliases) {
      if (normalizeText(alias).includes(query)) {
        results.push({
          category,
          score: 0.9,
          matchType: 'alias',
          matchedTerm: alias
        });
      }
    }

    // 4. Búsqueda fuzzy (similitud)
    const slugSimilarity = calculateSimilarity(query, normalizeText(category.slug));
    const nameEsSimilarity = calculateSimilarity(query, normalizeText(countryNameEs));
    const nameEnSimilarity = calculateSimilarity(query, normalizeText(countryNameEn));

    const maxSimilarity = Math.max(slugSimilarity, nameEsSimilarity, nameEnSimilarity);
    
    if (maxSimilarity >= 0.4 && maxSimilarity < 0.8) {
      let matchedTerm = category.slug;
      if (nameEsSimilarity === maxSimilarity) matchedTerm = countryNameEs;
      else if (nameEnSimilarity === maxSimilarity) matchedTerm = countryNameEn;

      results.push({
        category,
        score: maxSimilarity * 0.8, // Penalizar búsquedas fuzzy
        matchType: 'fuzzy',
        matchedTerm
      });
    }

    // 5. Búsqueda parcial en aliases con fuzzy matching
    for (const alias of aliases) {
      const aliasSimilarity = calculateSimilarity(query, normalizeText(alias));
      if (aliasSimilarity >= 0.5 && aliasSimilarity < 0.8) {
        results.push({
          category,
          score: aliasSimilarity * 0.7,
          matchType: 'fuzzy',
          matchedTerm: alias
        });
      }
    }

    return results;
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<number>();
    return results.filter(result => {
      if (seen.has(result.category.id)) {
        return false;
      }
      seen.add(result.category.id);
      return true;
    });
  }

  // Función para obtener sugerencias cuando no hay resultados
  getSuggestions(query: string): string[] {
    const normalizedQuery = normalizeText(query);
    const suggestions: Array<{ term: string; score: number }> = [];

    // Sugerencias de regiones
    for (const regionName of Object.keys(regionMapping)) {
      const similarity = calculateSimilarity(normalizedQuery, normalizeText(regionName));
      if (similarity >= 0.3) {
        suggestions.push({ term: regionName, score: similarity });
      }
    }

    // Sugerencias de países
    for (const category of this.categories) {
      const countryNameEs = countryUtils.getCountryName(category.slug, 'es');
      const countryNameEn = countryUtils.getCountryName(category.slug, 'en');
      
      const similarities = [
        { term: countryNameEs, score: calculateSimilarity(normalizedQuery, normalizeText(countryNameEs)) },
        { term: countryNameEn, score: calculateSimilarity(normalizedQuery, normalizeText(countryNameEn)) },
        { term: category.slug, score: calculateSimilarity(normalizedQuery, normalizeText(category.slug)) }
      ];

      for (const sim of similarities) {
        if (sim.score >= 0.3) {
          suggestions.push(sim);
        }
      }

      // Sugerencias de aliases
      const aliases = countryAliases[category.slug] || [];
      for (const alias of aliases) {
        const similarity = calculateSimilarity(normalizedQuery, normalizeText(alias));
        if (similarity >= 0.3) {
          suggestions.push({ term: alias, score: similarity });
        }
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.term);
  }
}