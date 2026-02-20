// Content script for detecting Polymarket market pages
console.log('🎯 Bunch content script loaded');

let currentMarketId = null;
let currentMarketTitle = null;
let marketContextDebounceTimer = null;

/**
 * Category page mapping - maps Polymarket category URLs to global chat slugs
 */
const CATEGORY_MAPPING = {
  'politics': 'politics',
  'geopolitics': 'geopolitics',
  'sports': 'sports',
  'crypto': 'crypto',
  'finance': 'finance',
  'earnings': 'earnings',
  'tech': 'tech',
  'culture': 'culture',
  'elections': 'elections',
};

/**
 * Extract market ID from Polymarket URL
 * Polymarket URLs can be:
 * - https://polymarket.com/event/{slug}?tid={marketId}
 * - https://polymarket.com/event/{slug}
 * - https://polymarket.com/sports/{league}/{slug} (sports markets)
 * - Category pages: https://polymarket.com/geopolitics, /sports/live, /politics/anything
 */
function extractMarketInfo() {
  const url = window.location.href;
  const pathname = window.location.pathname;

  // Check for sports market pages first (more specific pattern)
  // Pattern: /sports/{league}/{slug} or /sports/{category}/{league}/{slug}
  const sportsMatch = pathname.match(/^\/sports\/([^\/]+\/[^\/\?]+)/);
  if (sportsMatch) {
    const slug = sportsMatch[1]; // e.g., "epl/epl-wol-ars-2026-02-18"
    
    // Try to get market ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tid = urlParams.get('tid');
    
    // Use tid if available, otherwise use full path as slug
    const marketId = tid || slug.replace(/\//g, '-'); // Convert slashes to dashes for ID
    
    // Try to extract market title from page
    let marketTitle = extractMarketTitle(slug);
    
    return {
      marketId,
      marketTitle,
      url,
      categorySlug: null, // This is a specific market, not a category page
    };
  }

  // Check if we're on a general category page (matches /category or /category/*)
  // But NOT if it looks like a specific event
  const categoryMatch = pathname.match(/^\/([^\/]+)(?:\/([^\/]+))?$/);
  if (categoryMatch) {
    const topLevelPath = categoryMatch[1];
    const secondLevel = categoryMatch[2];
    
    // If second level looks like "live" or other category pages, treat as category
    if (CATEGORY_MAPPING[topLevelPath] && (!secondLevel || secondLevel === 'live' || secondLevel === 'trending')) {
      return {
        marketId: null,
        marketTitle: null,
        url,
        categorySlug: CATEGORY_MAPPING[topLevelPath],
      };
    }
  }

  // Check if we're on a market page (event or market)
  const marketMatch = pathname.match(/\/(event|market)\/([^\/\?]+)/);
  
  if (!marketMatch) {
    return null;
  }

  // Extract slug as market ID (we'll use this as unique identifier)
  const slug = marketMatch[2];

  // Try to get market ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tid = urlParams.get('tid');

  // Use tid if available, otherwise use slug
  const marketId = tid || slug;

  // Try to extract market title from page
  let marketTitle = extractMarketTitle(slug);

  return {
    marketId,
    marketTitle,
    url,
  };
}

/**
 * Extract market title from page
 */
function extractMarketTitle(fallbackSlug) {
  // Method 1: Try to get from page title
  const pageTitle = document.title;
  if (pageTitle && !pageTitle.includes('Polymarket')) {
    return pageTitle.replace(' | Polymarket', '').trim();
  }

  // Method 2: Try to get from H1 tag
  const h1 = document.querySelector('h1');
  if (h1) {
    return h1.textContent.trim();
  }

  // Method 3: Try to get from meta tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    return ogTitle.getAttribute('content');
  }

  // Fallback to slug
  return fallbackSlug;
}

/**
 * Send market context to the side panel
 */
function sendMarketContext(marketInfo) {
  try {
    // Test if extension context is valid by accessing chrome.runtime
    const isValid = chrome.runtime && chrome.runtime.id;
    if (!isValid) {
      return;
    }
  } catch (e) {
    // Extension context invalidated
    return;
  }

  try {
    if (!marketInfo) {
      // Not on a market page or category, send null context
      chrome.runtime.sendMessage({
        type: 'POLYMARKET_CONTEXT',
        marketId: null,
        marketTitle: null,
        categorySlug: null,
      });
      return;
    }

    // Handle category pages
    if (marketInfo.categorySlug) {
      console.log('📍 Detected Polymarket category:', marketInfo.categorySlug);
      chrome.runtime.sendMessage({
        type: 'POLYMARKET_CONTEXT',
        marketId: null,
        marketTitle: null,
        categorySlug: marketInfo.categorySlug,
        url: marketInfo.url,
      });
      return;
    }

    // Only send if market has changed
    if (marketInfo.marketId !== currentMarketId) {
      currentMarketId = marketInfo.marketId;
      currentMarketTitle = marketInfo.marketTitle;

      console.log('📍 Detected Polymarket market:', marketInfo);

      chrome.runtime.sendMessage({
        type: 'POLYMARKET_CONTEXT',
        marketId: marketInfo.marketId,
        marketTitle: marketInfo.marketTitle,
        url: marketInfo.url,
        categorySlug: null,
      });
    }
  } catch (error) {
    // Silently ignore context errors
  }
}

/**
 * Initialize detection
 */
function initializeDetection() {
  // Initial detection
  const marketInfo = extractMarketInfo();
  sendMarketContext(marketInfo);

  // Watch for URL changes (SPA navigation)
  let lastUrl = window.location.href;
  
  // Debounced market context update (prevents spam from rapid navigation)
  const debouncedUpdateMarketContext = () => {
    if (marketContextDebounceTimer) {
      clearTimeout(marketContextDebounceTimer);
    }
    
    marketContextDebounceTimer = setTimeout(() => {
      const marketInfo = extractMarketInfo();
      sendMarketContext(marketInfo);
    }, 1000); // 1 second debounce
  };
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('🔄 URL changed, re-detecting market...');
      debouncedUpdateMarketContext();
    }
  });

  // Observe changes to the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also watch for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    debouncedUpdateMarketContext();
  });

  // Watch for pushState/replaceState (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    debouncedUpdateMarketContext();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    debouncedUpdateMarketContext();
  };
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDetection);
} else {
  initializeDetection();
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.type === 'GET_CURRENT_MARKET') {
      const marketInfo = extractMarketInfo();
      sendResponse(marketInfo);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
});
