/**
 * UK Date Formatting Utilities
 * All dates should be displayed in DD/MM/YYYY format throughout the app
 */

/**
 * Format a date to UK format (DD/MM/YYYY)
 */
export function formatDateUK(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format a date to UK format with time (DD/MM/YYYY HH:MM)
 */
export function formatDateTimeUK(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format a date to UK short format (DD/MM)
 */
export function formatDateShortUK(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  
  return `${day}/${month}`;
}

/**
 * Format a date to UK long format (DD Month YYYY)
 */
export function formatDateLongUK(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format a date to UK format with weekday (Day, DD/MM/YYYY)
 */
export function formatDateWithWeekdayUK(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${weekday}, ${day}/${month}/${year}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDateUK(d);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}
