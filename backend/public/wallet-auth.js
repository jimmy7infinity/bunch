const API_URL = window.location.origin + '/api';
let userAddress = null;

// Get redirect_uri from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const redirectUri = urlParams.get('redirect_uri');

function setStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
}

function setButtonState(disabled, text) {
    const btn = document.getElementById('connectBtn');
    btn.disabled = disabled;
    btn.innerHTML = disabled ? `<span class="spinner"></span>${text}` : text;
}

async function connectWallet() {
    console.log('🔵 Connect wallet clicked');
    console.log('🔍 window.ethereum:', typeof window.ethereum);
    console.log('🌐 API_URL:', API_URL);
    
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            console.error('❌ No Web3 wallet detected');
            setStatus('Please install MetaMask or another Web3 wallet', 'error');
            return;
        }
        
        console.log('✅ Web3 wallet detected');
        setButtonState(true, 'Connecting...');
        setStatus('Requesting wallet connection...', 'info');
        
        // Request account access
        console.log('📡 Requesting accounts...');
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        userAddress = accounts[0];
        console.log('✅ Connected:', userAddress);
        document.getElementById('walletAddress').textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        document.getElementById('walletAddress').style.display = 'block';
        
        setStatus('Generating signature message...', 'info');
        
        // Request nonce from backend
        console.log('📡 Requesting nonce from:', `${API_URL}/auth/siwe/nonce`);
        const nonceResponse = await fetch(`${API_URL}/auth/siwe/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: userAddress })
        });
        
        console.log('📥 Nonce response status:', nonceResponse.status);
        
        if (!nonceResponse.ok) {
            const errorText = await nonceResponse.text();
            console.error('❌ Nonce error:', errorText);
            throw new Error('Failed to get nonce: ' + errorText);
        }
        
        const { nonce } = await nonceResponse.json();
        console.log('✅ Got nonce:', nonce);
        
        // Create SIWE message
        const message = `Welcome to Bunch!\n\nClick "Sign" to securely authenticate your wallet.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet: ${userAddress}\nNonce: ${nonce}`;
        
        setStatus('Please sign the message in your wallet...', 'info');
        
        // Request signature
        console.log('✍️ Requesting signature...');
        console.log('📝 Message being signed (raw):', message);
        console.log('📝 Message hex:', '0x' + Array.from(new TextEncoder().encode(message))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));
        
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, userAddress]
        });
        
        console.log('✅ Signature returned from MetaMask:', signature);
        
        console.log('✅ Got signature:', signature.slice(0, 20) + '...');
        setStatus('Verifying signature...', 'info');
        
        // Log what we're about to send
        console.log('📤 Data being sent to backend:');
        console.log('  Address:', userAddress);
        console.log('  Signature:', signature);
        console.log('  Message:', message);
        console.log('  Message length:', message.length);
        console.log('  Message bytes:', new TextEncoder().encode(message).length);
        console.log('  Nonce:', nonce);
        
        // Create a form to POST to the verify endpoint
        // This allows the backend to do a proper server-side redirect
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${API_URL}/auth/siwe/verify${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`;
        
        // Add form fields
        const fields = {
            address: userAddress,
            signature: signature,
            message: message,
            nonce: nonce
        };
        
        for (const [key, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
        
        console.log('📡 Submitting form to:', form.action);
        console.log('📡 Form fields:', Array.from(form.elements).map(el => ({ name: el.name, valueLength: el.value?.length })));
        document.body.appendChild(form);
        form.submit();
        
        // Note: The page will navigate away after form submission
        setStatus('✅ Authentication successful! Redirecting...', 'info');
        setButtonState(true, 'Success!');
        
    } catch (error) {
        console.error('❌ Wallet auth error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        if (error.code === 4001) {
            setStatus('Authentication cancelled', 'error');
        } else {
            setStatus(`Error: ${error.message || 'Authentication failed'}`, 'error');
        }
        
        setButtonState(false, 'Try Again');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔵 Wallet auth page loaded');
    console.log('🌐 Origin:', window.location.origin);
    console.log('🌐 API_URL:', API_URL);
    console.log('🔗 Redirect URI:', redirectUri || 'none (will use auth-success page)');
    
    // Attach button click handler
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
    
    // Auto-connect if wallet is already connected
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ 
            method: 'eth_accounts' 
        }).then(accounts => {
            if (accounts.length > 0) {
                setStatus('Wallet detected. Click to connect.', 'info');
            }
        }).catch(error => {
            console.error('Failed to check wallet connection:', error);
        });
    }
});
