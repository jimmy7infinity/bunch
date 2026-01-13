// Content script for detecting Polymarket market pages
console.log('🎯 PolyBanter content script loaded');

let currentMarketId = null;
let currentMarketTitle = null;

/**
 * Category mapping for global chats
 */
const CATEGORY_MAP = {
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
 * Extract category context from URL
 */
function extractCategoryInfo() {
  const pathname = window.location.pathname;
  
  // Check if we're on a category page
  for (const [path, chatName] of Object.entries(CATEGORY_MAP)) {
    if (pathname.startsWith(path)) {
      // Make sure it's not a market page within that category
      const isMarket = /\/(event|market)\//.test(pathname);
      if (!isMarket) {
        return {
          type: 'category',
          category: path.replace('/', ''),
          chatName,
          url: window.location.href,
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract market ID from Polymarket URL
 * Polymarket URLs are typically: https://polymarket.com/event/{slug}?tid={marketId}
 * or https://polymarket.com/event/{slug}
 */
function extractMarketInfo() {
  const url = window.location.href;
  const pathname = window.location.pathname;

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
    type: 'market',
    marketId,
    marketTitle: marketTitle || slug,
    url,
  };
}

/**
 * Send context to the side panel (market or category)
 */
function sendContext(contextInfo) {
  if (!contextInfo) {
    // Not on a market or category page, send null context
    chrome.runtime.sendMessage({
      type: 'POLYMARKET_CONTEXT',
      contextType: null,
      marketId: null,
      marketTitle: null,
      category: null,
      chatName: null,
    });
    currentMarketId = null;
    currentMarketTitle = null;
    return;
  }

  if (contextInfo.type === 'market') {
    // Only send if market has changed
    if (contextInfo.marketId !== currentMarketId) {
      currentMarketId = contextInfo.marketId;
      currentMarketTitle = contextInfo.marketTitle;

      console.log('📍 Detected Polymarket market:', contextInfo);

      chrome.runtime.sendMessage({
        type: 'POLYMARKET_CONTEXT',
        contextType: 'market',
        marketId: contextInfo.marketId,
        marketTitle: contextInfo.marketTitle,
        url: contextInfo.url,
      });
    }
  } else if (contextInfo.type === 'category') {
    // Send category context
    console.log('📂 Detected Polymarket category:', contextInfo);

    chrome.runtime.sendMessage({
      type: 'POLYMARKET_CONTEXT',
      contextType: 'category',
      category: contextInfo.category,
      chatName: contextInfo.chatName,
      url: contextInfo.url,
    });
    
    // Clear market context
    currentMarketId = null;
    currentMarketTitle = null;
  }
}

/**
 * Detect current context (market or category)
 */
function detectContext() {
  // Try market first (more specific)
  const marketInfo = extractMarketInfo();
  if (marketInfo) {
    return marketInfo;
  }
  
  // Try category
  const categoryInfo = extractCategoryInfo();
  if (categoryInfo) {
    return categoryInfo;
  }
  
  // No context
  return null;
}

/**
 * Initialize detection
 */
function initializeDetection() {
  // Initial detection
  const context = detectContext();
  sendContext(context);

  // Watch for URL changes (SPA navigation)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('🔄 URL changed, re-detecting context...');
      
      // Wait a bit for DOM to update
      setTimeout(() => {
        const context = detectContext();
        sendContext(context);
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
      const context = detectContext();
      sendContext(context);
    }, 500);
  });

  // Watch for pushState/replaceState (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => {
      const context = detectContext();
      sendContext(context);
    }, 500);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => {
      const context = detectContext();
      sendContext(context);
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
  if (message.type === 'GET_CURRENT_MARKET') {
    const context = detectContext();
    sendResponse(context);
  }
});
