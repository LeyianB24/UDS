import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Global API fetching helper for Next.js.
 */
export function fetchDashboardData() {
  // Placeholder for real data fetching from PHP.
  // We'll use the API bridge for this.
}
