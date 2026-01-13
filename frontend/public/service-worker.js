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

// Listen for messages from content script and side panel
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
  
  // Handle OAuth start request from side panel
  if (message.type === 'START_AUTH') {
    console.log('🔐 Starting Twitter OAuth flow via chrome.identity');
    
    // Get the extension's redirect URL
    const redirectUri = chrome.identity.getRedirectURL('auth');
    console.log('🔗 Extension redirect URI:', redirectUri);
    
    // Build auth URL with redirect_uri parameter
    const backendUrl = 'https://poly-banter.up.railway.app';
    const authUrl = `${backendUrl}/api/auth/twitter?redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('🚀 Launching web auth flow to:', authUrl);
    
    // Launch OAuth flow in Chrome-managed window
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          console.error('❌ OAuth failed:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        
        console.log('✅ OAuth callback received:', responseUrl);
        
        // Extract token from response URL
        try {
          const url = new URL(responseUrl);
          const token = url.searchParams.get('token');
          
          if (token) {
            console.log('🔑 Token extracted, storing in chrome.storage');
            
            // Store token (source of truth for auth state)
            chrome.storage.local.set({ 
              authToken: token,
              authUpdatedAt: Date.now()
            }, () => {
              console.log('✅ Token stored successfully');
              console.log('💡 Side panel will read token on next mount/refresh');
              
              sendResponse({ success: true });
            });
          } else {
            console.error('❌ No token found in response URL');
            sendResponse({ success: false, error: 'No token in response' });
          }
        } catch (error) {
          console.error('❌ Failed to parse response URL:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
    );
    
    return true; // Keep message channel open for async response
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





