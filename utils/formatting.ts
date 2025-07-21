/**
 * Formatting utility functions for the Aptly app
 * These functions provide consistent formatting across the application
 */

/**
 * Format currency values in Indian Rupee format
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  options: { 
    showSymbol?: boolean; 
    decimals?: number;
    showFullForm?: boolean;
  } = {}
): string => {
  const { showSymbol = true, decimals = 0, showFullForm = false } = options;
  
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  if (!showSymbol) return formatted;
  
  if (showFullForm && amount >= 100000) {
    const lakhs = Math.floor(amount / 100000);
    const remainder = amount % 100000;
    
    if (remainder === 0) {
      return `₹${lakhs} Lakh${lakhs > 1 ? 's' : ''}`;
    } else if (remainder >= 1000) {
      const thousands = Math.floor(remainder / 1000);
      return `₹${lakhs}.${thousands.toString().padStart(2, '0')} Lakhs`;
    }
  }
  
  return `₹${formatted}`;
};

/**
 * Format Indian phone numbers consistently
 * @param phone - Phone number string
 * @param options - Formatting options
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phone: string,
  options: { 
    showCountryCode?: boolean; 
    format?: 'display' | 'input' | 'link';
  } = {}
): string => {
  const { showCountryCode = false, format = 'display' } = options;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle Indian mobile numbers (10 digits)
  if (digits.length === 10) {
    const formatted = digits.replace(/(\d{5})(\d{5})/, '$1 $2');
    
    switch (format) {
      case 'input':
        return formatted;
      case 'link':
        return showCountryCode ? `+91${digits}` : digits;
      case 'display':
      default:
        return showCountryCode ? `+91 ${formatted}` : formatted;
    }
  }
  
  // Handle numbers with country code
  if (digits.length === 12 && digits.startsWith('91')) {
    const number = digits.slice(2);
    const formatted = number.replace(/(\d{5})(\d{5})/, '$1 $2');
    return format === 'link' ? `+91${number}` : `+91 ${formatted}`;
  }
  
  return phone; // Return original if format not recognized
};

/**
 * Format dates consistently across the app
 * @param date - Date to format
 * @param format - Format type
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' | 'time' | 'datetime' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'datetime':
      return dateObj.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'relative':
      return getRelativeTime(dateObj);
    
    default:
      return dateObj.toLocaleDateString('en-IN');
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "Yesterday")
 * @param date - Date to get relative time for
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, 'short');
  }
};

/**
 * Format file sizes in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Capitalize first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
};