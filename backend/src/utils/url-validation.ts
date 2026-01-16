/**
 * URL Validation Utility
 * 
 * Validates URLs for security (XSS prevention, protocol validation)
 */

// Allowed image/media domains
const ALLOWED_IMAGE_DOMAINS = [
  'res.cloudinary.com', // Cloudinary
  'media.tenor.com', // Tenor GIFs
  'media1.tenor.com',
  'media2.tenor.com',
  'media3.tenor.com',
  'media4.tenor.com',
  'c.tenor.com',
];

/**
 * Validate if a URL is safe for images/media
 */
export function isValidMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Check if domain is in whitelist
    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_IMAGE_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    return isAllowed;
  } catch (error) {
    // Invalid URL
    return false;
  }
}

/**
 * Sanitize a URL (remove dangerous characters)
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove javascript: and data: protocols
  if (url.toLowerCase().startsWith('javascript:') || 
      url.toLowerCase().startsWith('data:')) {
    return '';
  }

  return url.trim();
}

/**
 * Validate Polymarket profile URL
 */
export function isValidPolymarketUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    
    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Must be polymarket.com domain
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'polymarket.com' && !hostname.endsWith('.polymarket.com')) {
      return false;
    }

    // Must be a profile URL (/@username)
    if (!parsed.pathname.startsWith('/@')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
