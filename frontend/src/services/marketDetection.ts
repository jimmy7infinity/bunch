import { useChatStore } from '../stores/chatStore';

/**
 * Market Detection Service
 * Listens for Polymarket market context from the Chrome extension content script
 */

let port: chrome.runtime.Port | null = null;

export function initializeMarketDetection() {
  // Check if we're running as a Chrome extension
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.log('⚠️ Not running as Chrome extension, market detection disabled');
    return;
  }

  try {
    // Connect to background script
    port = chrome.runtime.connect({ name: 'polybanter-sidepanel' });

    console.log('🔌 Connected to extension background script');

    // Listen for market/category context updates
    port.onMessage.addListener((message) => {
      if (message.type === 'POLYMARKET_CONTEXT') {
        console.log('📍 Received context:', message);

        const { contextType, marketId, marketTitle, category, chatName, url } = message;

        // Update store
        if (contextType === 'market' && marketId) {
          useChatStore.getState().setMarketContext({
            contextType: 'market',
            marketId,
            marketTitle,
            url,
            timestamp: Date.now(),
          });
        } else if (contextType === 'category' && category) {
          useChatStore.getState().setMarketContext({
            contextType: 'category',
            category,
            chatName,
            url,
            timestamp: Date.now(),
          });
        } else {
          // Clear context if not on a market or category page
          useChatStore.getState().setMarketContext(null);
        }
      }
    });

    // Handle disconnection
    port.onDisconnect.addListener(() => {
      console.log('🔌 Disconnected from extension background script');
      port = null;
    });

    // Request initial market context
    setTimeout(() => {
      if (port) {
        port.postMessage({ type: 'GET_MARKET_CONTEXT' });
      }
    }, 500);

    // Also check chrome.storage for persisted context
    chrome.storage.local.get(['currentMarketContext'], (result) => {
      if (result.currentMarketContext) {
        const context = result.currentMarketContext;
        useChatStore.getState().setMarketContext(context);
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.currentMarketContext) {
        const context = changes.currentMarketContext.newValue;
        if (context && context.contextType) {
          useChatStore.getState().setMarketContext(context);
        } else {
          useChatStore.getState().setMarketContext(null);
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize market detection:', error);
  }
}

export function disconnectMarketDetection() {
  if (port) {
    port.disconnect();
    port = null;
  }
}

// Export for debugging
(window as any).__marketDetection = {
  getCurrentContext: () => useChatStore.getState().currentMarketContext,
  requestUpdate: () => {
    if (port) {
      port.postMessage({ type: 'GET_MARKET_CONTEXT' });
    }
  },
};
