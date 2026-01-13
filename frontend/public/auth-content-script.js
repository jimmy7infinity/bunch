// Content script for auth callback page
console.log('🔐 Auth content script loaded');

// Extract token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (token) {
  console.log('🔑 Token found in URL, storing in chrome.storage');
  
  // Store token in chrome.storage (content scripts have access to this)
  chrome.storage.local.set({ authToken: token }, () => {
    console.log('✅ Token stored successfully in chrome.storage');
    
    // Close the tab after a brief delay
    setTimeout(() => {
      console.log('👋 Closing auth tab');
      window.close();
    }, 1500);
  });
} else {
  console.error('❌ No token found in URL');
}
