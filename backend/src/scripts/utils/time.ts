/**
 * Time utility functions for PolyBanter scripts
 */

/**
 * Get timestamp for N days ago
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get timestamp for N hours ago
 */
export function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

/**
 * Get timestamp for N minutes ago
 */
export function minutesAgo(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

/**
 * Check if date is older than N days
 */
export function isOlderThan(date: Date, days: number): boolean {
  const threshold = daysAgo(days);
  return date < threshold;
}

/**
 * Format date for logging
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Get month string (YYYY-MM) for grouping
 */
export function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
