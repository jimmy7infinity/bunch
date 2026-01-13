/**
 * Category Mapping Utility
 * Maps Polymarket category URLs to PolyBanter global chat names
 */

export interface CategoryContext {
  category: string;
  chatName: string;
  url: string;
}

/**
 * Maps Polymarket URL paths to global chat categories
 */
const CATEGORY_MAP: Record<string, string> = {
  '/politics': 'Politics',
  '/sports': 'Sports',
  '/crypto': 'Crypto',
  '/finance': 'Finance',
  '/geopolitics': 'Geopolitics',
  '/earnings': 'Earnings',
  '/tech': 'Tech',
  '/culture': 'Culture',
  '/world': 'World',
  '/economy': 'Economy',
  '/climate': 'Climate & Science',
  '/science': 'Climate & Science',
  '/elections': 'Elections',
};

/**
 * Extract category context from a Polymarket URL
 * @param url Full URL or pathname
 * @returns CategoryContext if category detected, null otherwise
 */
export function extractCategoryFromUrl(url: string): CategoryContext | null {
  try {
    const pathname = url.includes('http') 
      ? new URL(url).pathname 
      : url;

    // Check if pathname matches any category
    for (const [path, chatName] of Object.entries(CATEGORY_MAP)) {
      if (pathname.startsWith(path)) {
        return {
          category: path.replace('/', ''),
          chatName,
          url,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to extract category from URL:', error);
    return null;
  }
}

/**
 * Check if URL is a category page (not a specific market)
 * @param url Full URL or pathname
 */
export function isCategoryPage(url: string): boolean {
  const pathname = url.includes('http') 
    ? new URL(url).pathname 
    : url;

  // It's a category page if:
  // 1. It matches a category path
  // 2. It's NOT a market/event page
  const isCategory = Object.keys(CATEGORY_MAP).some(path => 
    pathname.startsWith(path)
  );
  
  const isMarket = /\/(event|market)\//.test(pathname);

  return isCategory && !isMarket;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.values(CATEGORY_MAP);
}
