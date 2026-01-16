/**
 * Input Sanitization Utility
 * 
 * Sanitizes user input to prevent XSS, injection attacks, etc.
 */

/**
 * Sanitize text input (remove HTML, limit length)
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize search query (escape special regex characters)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Escape special regex characters
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Limit length
  return escaped.substring(0, 100);
}

/**
 * Sanitize username (alphanumeric + underscore only)
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  // Only allow alphanumeric and underscore
  const sanitized = username.replace(/[^a-zA-Z0-9_]/g, '');

  // Limit length
  return sanitized.substring(0, 30);
}

/**
 * Sanitize bio/description
 */
export function sanitizeBio(bio: string): string {
  return sanitizeText(bio, 500);
}

/**
 * Validate and sanitize MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize array of IDs
 */
export function sanitizeIdArray(ids: string[]): string[] {
  if (!Array.isArray(ids)) {
    return [];
  }

  return ids
    .filter(id => isValidObjectId(id))
    .slice(0, 100); // Limit to 100 IDs
}
