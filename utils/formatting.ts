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
    decimalPlaces?: number;
    showFullForm?: boolean;
    currency?: string;
    locale?: string;
  } = {}
): string => {
  const { 
    showSymbol = true, 
    decimals = (amount % 1 !== 0 ? 2 : 0),
    decimalPlaces = decimals,
    showFullForm = false,
    currency = 'INR',
    locale = 'en-IN'
  } = options;
  
  const finalDecimals = decimalPlaces !== undefined ? decimalPlaces : decimals;
  
  if (currency === 'USD' && locale === 'en-US') {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals,
    });
    return showSymbol ? `$${formatted}` : formatted;
  }
  
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals,
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
    return '1 day ago';
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
export const formatFileSize = (bytes: number, decimals?: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const value = bytes / Math.pow(k, i);
  
  // Determine format based on exact values or decimal specification
  let formattedValue: string;
  if (decimals !== undefined) {
    formattedValue = value.toFixed(decimals);
  } else if (value % 1 === 0) {
    // Whole numbers don't need decimals
    formattedValue = Math.round(value).toString();
  } else {
    // Show 2 decimal places for non-whole numbers by default
    formattedValue = value.toFixed(2);
  }
  
  // Use 'B' for bytes under 1024, otherwise use full names
  const unit = sizes[i] === 'Bytes' && bytes < 1024 ? 'B' : sizes[i];
  
  return `${formattedValue} ${unit}`;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Custom ellipsis string
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number, ellipsis: string = '...'): string => {
  if (text.length <= maxLength) return text;
  
  const cutOff = maxLength - ellipsis.length;
  return `${text.substring(0, cutOff)}${ellipsis}`;
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

/**
 * Format Indian currency with proper commas
 * @param amount - Amount to format
 * @returns Formatted Indian currency
 */
export const formatIndianCurrency = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = absAmount.toLocaleString('en-IN');
  const result = `₹${formatted}`;
  
  return isNegative ? `-${result}` : result;
};

/**
 * Format phone number for different countries and formats
 * @param phone - Phone number
 * @param country - Country code
 * @param options - Format options
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phone: string,
  country: string,
  options: { format?: string } = {}
): string => {
  const { format = 'international' } = options;
  const digits = phone.replace(/\D/g, '');
  
  if (country === 'IN') {
    let number = digits;
    if (digits.length === 12 && digits.startsWith('91')) {
      number = digits.slice(2);
    }
    
    if (number.length === 10) {
      switch (format) {
        case 'national':
          return number.replace(/(\d{5})(\d{5})/, '$1 $2');
        case 'dots':
          return number.replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
        case 'international':
        default:
          return `+91 ${number.replace(/(\d{5})(\d{5})/, '$1 $2')}`;
      }
    }
  }
  
  return phone;
};

/**
 * Format date with custom format strings
 * @param date - Date to format
 * @param format - Format string or preset
 * @returns Formatted date
 */
export const formatDate = (
  date: Date | string,
  format?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  if (!format) {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    });
  }
  
  // Handle custom format strings
  if (format === 'dd/MM/yyyy') {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  if (format === 'MMMM d, yyyy') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Default to preset formats
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
    default:
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      });
  }
};

/**
 * Format relative time
 * @param date - Date to get relative time for
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date): string => {
  return getRelativeTime(date);
};

/**
 * Format percentage
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  // Convert decimal to percentage (0.25 -> 25%)
  const percentage = value * 100;
  return decimals === 0 && percentage % 1 === 0 
    ? `${Math.round(percentage)}%`
    : `${percentage.toFixed(decimals)}%`;
};

/**
 * Format duration in minutes/hours
 * @param minutes - Duration in minutes
 * @returns Formatted duration
 */
export const formatDuration = (seconds: number, format?: string): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (format === 'long') {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
    return parts.join(' ');
  }
  
  // Default short format
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m 0s`;
  } else {
    const parts = [`${hours}h`];
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    return parts.join(' ');
  }
};

/**
 * Capitalize first letter
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format address for display
 * @param address - Address object or string
 * @returns Formatted address
 */
export const formatAddress = (address: any, options?: { includeCountry?: boolean }): string => {
  if (typeof address === 'string') return address;
  
  const { includeCountry = true } = options || {};
  
  const parts = [
    address.line1,
    address.line2,
    address.city,
    // Format state and pincode together when both exist
    address.state && address.pincode ? `${address.state} ${address.pincode}` : address.state || address.pincode,
  ].filter(Boolean);
  
  if (includeCountry && address.country) {
    parts.push(address.country);
  }
  
  return parts.join(', ');
};

/**
 * Format vehicle number
 * @param vehicleNumber - Vehicle number
 * @returns Formatted vehicle number
 */
export const formatVehicleNumber = (vehicleNumber: string): string => {
  const clean = vehicleNumber.replace(/\s/g, '').toUpperCase();
  
  // Indian format patterns:
  // Old format: XX00XXXX (8 chars) -> XX 00 XXXX
  // New format: XX00XX0000 (10 chars) -> XX 00 XX 0000
  if (clean.length === 8) {
    return clean.replace(/(\w{2})(\d{2})(\w{4})/, '$1 $2 $3');
  } else if (clean.length === 10) {
    return clean.replace(/(\w{2})(\d{2})(\w{2})(\d{4})/, '$1 $2 $3 $4');
  }
  
  return vehicleNumber;
};