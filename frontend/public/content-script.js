// Content script for detecting Polymarket market pages
console.log('🎯 PolyBanter content script loaded');

let currentMarketId = null;
let currentMarketTitle = null;

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
 * Polymarket URLs are typically: https://polymarket.com/event/{slug}?tid={marketId}
 * or https://polymarket.com/event/{slug}
 * or category pages: https://polymarket.com/geopolitics, /sports/live, /politics/anything
 */
function extractMarketInfo() {
  const url = window.location.href;
  const pathname = window.location.pathname;

  // Check if we're on a category page first (matches /category or /category/*)
  const categoryMatch = pathname.match(/^\/([^\/]+)(?:\/|$)/);
  if (categoryMatch) {
    const topLevelPath = categoryMatch[1];
    const categorySlug = CATEGORY_MAPPING[topLevelPath];
    if (categorySlug) {
      return {
        marketId: null,
        marketTitle: null,
        url,
        categorySlug, // Signal this is a category page
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
  let marketTitle = null;
  
  // Method 1: Try to get from page title
  const pageTitle = document.title;
  if (pageTitle && !pageTitle.includes('Polymarket')) {
    marketTitle = pageTitle.replace(' | Polymarket', '').trim();
  }

  // Method 2: Try to get from H1 tag
  if (!marketTitle) {
    const h1 = document.querySelector('h1');
    if (h1) {
      marketTitle = h1.textContent.trim();
    }
  }

  // Method 3: Try to get from meta tags
  if (!marketTitle) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      marketTitle = ogTitle.getAttribute('content');
    }
  }

  return {
    marketId,
    marketTitle: marketTitle || slug,
    url,
  };
}

/**
 * Send market context to the side panel
 */
function sendMarketContext(marketInfo) {
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.log('⚠️ Extension context invalidated - will reconnect on next page load');
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
    // Extension context invalidated (happens after reload)
    // Silently ignore - the content script will reload on next page load
    console.log('⚠️ Extension error:', error.message);
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
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('🔄 URL changed, re-detecting market...');
      
      // Wait a bit for DOM to update
      setTimeout(() => {
        const marketInfo = extractMarketInfo();
        sendMarketContext(marketInfo);
      }, 500);
    }
  });

  // Observe changes to the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also watch for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      const marketInfo = extractMarketInfo();
      sendMarketContext(marketInfo);
    }, 500);
  });

  // Watch for pushState/replaceState (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => {
      const marketInfo = extractMarketInfo();
      sendMarketContext(marketInfo);
    }, 500);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => {
      const marketInfo = extractMarketInfo();
      sendMarketContext(marketInfo);
    }, 500);
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
