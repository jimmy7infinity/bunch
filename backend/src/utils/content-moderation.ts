/**
 * Content Moderation Utility
 * 
 * Filters messages for banned words and inappropriate content.
 * Allows swearing but blocks slurs and hate speech.
 */

// List of banned words (slurs, hate speech, etc.)
// This list can be expanded as needed
const BANNED_WORDS = [
  'nigger',
  'n1gger',
  // Add more as needed
];

// Common character substitutions used to bypass filters
const CHAR_SUBSTITUTIONS: Record<string, string[]> = {
  'a': ['@', '4', 'α'],
  'e': ['3', 'ε'],
  'i': ['1', '!', 'ι'],
  'o': ['0', 'ο'],
  's': ['$', '5', 'ς'],
  'l': ['1', '|'],
  'g': ['9'],
};

/**
 * Normalize text to catch character substitutions
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace common substitutions
  for (const [char, substitutes] of Object.entries(CHAR_SUBSTITUTIONS)) {
    for (const sub of substitutes) {
      normalized = normalized.replace(new RegExp(sub, 'g'), char);
    }
  }
  
  // Remove spaces, dots, dashes that might be used to bypass filters
  normalized = normalized.replace(/[\s\.\-_]/g, '');
  
  return normalized;
}

/**
 * Check if text contains banned words
 */
export function containsBannedWords(text: string): boolean {
  const normalized = normalizeText(text);
  
  for (const word of BANNED_WORDS) {
    // Check for exact match
    if (normalized.includes(word)) {
      return true;
    }
    
    // Check for word with boundaries (not part of other words)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get the specific banned word found in text (for logging)
 */
export function findBannedWord(text: string): string | null {
  const normalized = normalizeText(text);
  
  for (const word of BANNED_WORDS) {
    if (normalized.includes(word)) {
      return word;
    }
  }
  
  return null;
}

/**
 * Moderate message content
 * Returns { allowed: boolean, reason?: string }
 */
export function moderateContent(text: string): { allowed: boolean; reason?: string } {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty message' };
  }
  
  if (text.length > 5000) {
    return { allowed: false, reason: 'Message too long' };
  }
  
  if (containsBannedWords(text)) {
    const word = findBannedWord(text);
    return { 
      allowed: false, 
      reason: `Message contains prohibited language${word ? `: ${word}` : ''}` 
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user should be auto-banned based on behavior
 * (e.g., multiple violations in short time)
 */
export class ModerationTracker {
  private violations: Map<string, { count: number; lastViolation: Date }> = new Map();
  
  /**
   * Record a violation for a user
   * Returns true if user should be banned
   */
  recordViolation(userId: string): boolean {
    const now = new Date();
    const userViolations = this.violations.get(userId);
    
    if (!userViolations) {
      this.violations.set(userId, { count: 1, lastViolation: now });
      return false;
    }
    
    // Reset count if last violation was more than 24 hours ago
    const hoursSinceLastViolation = 
      (now.getTime() - userViolations.lastViolation.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastViolation > 24) {
      this.violations.set(userId, { count: 1, lastViolation: now });
      return false;
    }
    
    // Increment violation count
    userViolations.count++;
    userViolations.lastViolation = now;
    
    // Ban if 3+ violations in 24 hours
    return userViolations.count >= 3;
  }
  
  /**
   * Clear violations for a user (e.g., after warning)
   */
  clearViolations(userId: string): void {
    this.violations.delete(userId);
  }
  
  /**
   * Get violation count for a user
   */
  getViolationCount(userId: string): number {
    return this.violations.get(userId)?.count || 0;
  }
}

// Singleton instance
export const moderationTracker = new ModerationTracker();
