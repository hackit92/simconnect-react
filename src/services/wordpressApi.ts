const WORDPRESS_API_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://kb.ucc.systems';
const WP_API_BASE = `${WORDPRESS_API_URL}/wp-json/wp/v2`;

// WordPress API interfaces
interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details: {
        width: number;
        height: number;
      };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface WordPressAuthor {
  id: number;
  name: string;
  slug: string;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
  };
}

// Our blog post interface
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  fullContent: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  slug: string;
}

// Cache for language tag IDs
let languageTagsCache: { es: number | null; en: number | null } | null = null;

// Helper function to strip HTML tags and calculate read time
function calculateReadTime(content: string): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordsPerMinute = 200;
  const wordCount = plainText.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min`;
}

// Helper function to clean excerpt
function cleanExcerpt(excerpt: string): string {
  return excerpt
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[&hellip;\]/g, '...') // Replace WordPress ellipsis
    .trim();
}

// Get language tag IDs
async function getLanguageTagIds(): Promise<{ es: number | null; en: number | null }> {
  if (languageTagsCache) {
    return languageTagsCache;
  }

  try {
    const response = await fetch(`${WP_API_BASE}/tags?per_page=100`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const tags: WordPressTag[] = await response.json();
    
    const esTag = tags.find(tag => tag.slug === 'es' || tag.name.toLowerCase() === 'es');
    const enTag = tags.find(tag => tag.slug === 'en' || tag.name.toLowerCase() === 'en');
    
    languageTagsCache = {
      es: esTag?.id || null,
      en: enTag?.id || null
    };
    
    console.log('Language tags found:', languageTagsCache);
    return languageTagsCache;
  } catch (error) {
    console.warn('WordPress API not accessible (likely CORS issue):', error);
    // Return default values when WordPress API is not accessible
    languageTagsCache = { es: null, en: null };
    // Return default values when WordPress API is not accessible
    languageTagsCache = { es: null, en: null };
    return { es: null, en: null };
  }
}

// Get posts by language
export async function getPostsByLanguage(language: string, limit: number = 10): Promise<BlogPost[]> {
  try {
    const languageTags = await getLanguageTagIds();
    const tagId = language === 'es' ? languageTags.es : languageTags.en;
    
    if (!tagId) {
      console.warn(`WordPress API not available or no tag found for language: ${language}`);
      return [];
    }

    // Fetch posts with embedded data (author, featured media, terms)
    const url = `${WP_API_BASE}/posts?tags=${tagId}&per_page=${limit}&status=publish&_embed=true`;
    console.log('Fetching posts from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts: WordPressPost[] = await response.json();
    console.log(`Fetched ${posts.length} posts for language: ${language}`);
    
    return posts.map(transformWordPressPost);
  } catch (error) {
    console.warn('WordPress API not accessible, returning empty posts array:', error);
    return [];
  }
}

// Get single post by ID
export async function getPostById(postId: number): Promise<BlogPost | null> {
  try {
    const url = `${WP_API_BASE}/posts/${postId}?_embed=true`;
    console.log('Fetching post from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const post: WordPressPost = await response.json();
    return transformWordPressPost(post);
  } catch (error) {
    console.warn('WordPress API not accessible, returning null for post:', error);
    return null;
  }
}

// Transform WordPress post to our BlogPost interface
function transformWordPressPost(wpPost: WordPressPost): BlogPost {
  // Get author name
  let authorName = 'SimConnect Team';
  if (wpPost._embedded?.author && wpPost._embedded.author.length > 0) {
    authorName = wpPost._embedded.author[0].name;
  }

  // Get featured image
  let featuredImage = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop';
  if (wpPost._embedded?.['wp:featuredmedia'] && wpPost._embedded['wp:featuredmedia'].length > 0) {
    featuredImage = wpPost._embedded['wp:featuredmedia'][0].source_url;
  }

  // Get category name (use first category)
  let categoryName = 'General';
  if (wpPost._embedded?.['wp:term'] && wpPost._embedded['wp:term'].length > 0) {
    const categories = wpPost._embedded['wp:term'][0]; // Categories are usually the first term group
    if (categories && categories.length > 0) {
      categoryName = categories[0].name;
    }
  }

  // Get tags (excluding language tags)
  let postTags: string[] = [];
  if (wpPost._embedded?.['wp:term'] && wpPost._embedded['wp:term'].length > 1) {
    const tags = wpPost._embedded['wp:term'][1]; // Tags are usually the second term group
    if (tags) {
      postTags = tags
        .filter(tag => tag.slug !== 'es' && tag.slug !== 'en') // Exclude language tags
        .map(tag => tag.name);
    }
  }

  // Format date
  const postDate = new Date(wpPost.date);
  const formattedDate = postDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    excerpt: cleanExcerpt(wpPost.excerpt.rendered),
    fullContent: wpPost.content.rendered,
    image: featuredImage,
    author: authorName,
    date: formattedDate,
    readTime: calculateReadTime(wpPost.content.rendered),
    category: categoryName,
    tags: postTags,
    slug: wpPost.slug
  };
}

// Get all available tags (for debugging)
export async function getAllTags(): Promise<WordPressTag[]> {
  try {
    const response = await fetch(`${WP_API_BASE}/tags?per_page=100`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('WordPress API not accessible, returning empty tags array:', error);
    return [];
  }
}

// Test connection to WordPress API
export async function testWordPressConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${WP_API_BASE}/posts?per_page=1`);
    return response.ok;
  } catch (error) {
    console.warn('WordPress API connection test failed (likely CORS issue):', error);
    return false;
  }
}