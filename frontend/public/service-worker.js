// Service worker for Chrome extension
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

console.log('🚀 PolyBanter service worker loaded');

// Store current market context
let currentMarketContext = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'POLYMARKET_CONTEXT') {
    console.log('📍 Market context received:', message);
    
    // Store the context
    currentMarketContext = {
      marketId: message.marketId,
      marketTitle: message.marketTitle,
      url: message.url,
      timestamp: Date.now(),
    };

    // Store in chrome.storage for persistence
    chrome.storage.local.set({ currentMarketContext });

    // Try to send to all side panel instances
    // Note: This will be picked up by the side panel when it queries for context
    sendResponse({ success: true });
  }
});

// Allow side panel to query current market context
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'polybanter-sidepanel') {
    console.log('🔌 Side panel connected');

    // Send current context immediately
    if (currentMarketContext) {
      port.postMessage({
        type: 'POLYMARKET_CONTEXT',
        ...currentMarketContext,
      });
    }

    // Listen for context requests
    port.onMessage.addListener((msg) => {
      if (msg.type === 'GET_MARKET_CONTEXT') {
        port.postMessage({
          type: 'POLYMARKET_CONTEXT',
          ...currentMarketContext,
        });
      }
    });
  }
});





