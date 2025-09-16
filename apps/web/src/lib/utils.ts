import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Map currency symbols to ISO codes
  const currencyMap: Record<string, string> = {
    '₹': 'INR',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'Rs': 'INR',
    'INR': 'INR',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
    'JPY': 'JPY',
    'CAD': 'CAD',
    'AUD': 'AUD',
    'CHF': 'CHF',
    'CNY': 'CNY',
  };

  // Get the proper ISO currency code
  const isoCurrency = currencyMap[currency] || currency || 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isoCurrency,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if currency code is invalid
    console.warn(`Invalid currency code: ${currency}, falling back to USD`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
