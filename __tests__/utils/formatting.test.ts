import {
  formatCurrency,
  formatIndianCurrency,
  formatPhoneNumber,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatPercentage,
  formatDuration,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  formatAddress,
  formatVehicleNumber,
  getRelativeTime,
  getInitials
} from '../../utils/formatting';

describe('Formatting Utils', () => {
  describe('formatCurrency', () => {
    test('should format currency with default options', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(1000.50)).toBe('₹1,000.50');
      expect(formatCurrency(0)).toBe('₹0');
    });

    test('should format currency with custom options', () => {
      expect(formatCurrency(1000, { showSymbol: false })).toBe('1,000');
      expect(formatCurrency(1000, { currency: 'USD', locale: 'en-US' })).toMatch(/\$1,000/);
      expect(formatCurrency(1000.567, { decimalPlaces: 1 })).toBe('₹1,000.6');
    });

    test('should format currency with full form for lakhs', () => {
      expect(formatCurrency(500000, { showFullForm: true })).toBe('₹5 Lakhs');
      expect(formatCurrency(100000, { showFullForm: true })).toBe('₹1 Lakh');
      expect(formatCurrency(515000, { showFullForm: true })).toBe('₹5.15 Lakhs');
      expect(formatCurrency(99000, { showFullForm: true })).toBe('₹99,000'); // Under 1 lakh
    });

    test('should handle USD currency format', () => {
      expect(formatCurrency(1000, { currency: 'USD', locale: 'en-US', showSymbol: false })).toBe('1,000');
    });

    test('should handle decimals option', () => {
      expect(formatCurrency(1000.5, { decimals: 3 })).toBe('₹1,000.500');
      expect(formatCurrency(1000, { decimals: 2 })).toBe('₹1,000.00');
    });
  });

  describe('formatIndianCurrency', () => {
    test('should format Indian currency correctly', () => {
      expect(formatIndianCurrency(1000)).toBe('₹1,000');
      expect(formatIndianCurrency(100000)).toBe('₹1,00,000');
      expect(formatIndianCurrency(10000000)).toBe('₹1,00,00,000');
    });

    test('should handle negative amounts', () => {
      expect(formatIndianCurrency(-1000)).toBe('-₹1,000');
    });
  });

  describe('formatPhoneNumber', () => {
    test('should format Indian phone numbers', () => {
      expect(formatPhoneNumber('9876543210', 'IN')).toBe('+91 98765 43210');
      expect(formatPhoneNumber('+919876543210', 'IN')).toBe('+91 98765 43210');
    });

    test('should handle different formats', () => {
      expect(formatPhoneNumber('9876543210', 'IN', { format: 'national' })).toBe('98765 43210');
      expect(formatPhoneNumber('9876543210', 'IN', { format: 'dots' })).toBe('987.654.3210');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T10:30:00Z');

    test('should format date with default format', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/Mar 15, 2024/);
    });

    test('should format date with custom format', () => {
      expect(formatDate(testDate, 'dd/MM/yyyy')).toBe('15/03/2024');
      expect(formatDate(testDate, 'MMMM d, yyyy')).toBe('March 15, 2024');
    });

    test('should handle string dates', () => {
      const result = formatDate('2024-03-15');
      expect(result).toMatch(/Mar 15, 2024/);
    });
  });

  describe('formatRelativeTime', () => {
    test('should format recent times', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    test('should format older times', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      expect(formatRelativeTime(yesterday)).toBe('1 day ago');
    });
  });

  describe('formatFileSize', () => {
    test('should format file sizes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(500)).toBe('500 B');
    });

    test('should handle decimal places', () => {
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(2097152, 2)).toBe('2.00 MB');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentages correctly', () => {
      expect(formatPercentage(0.25)).toBe('25%');
      expect(formatPercentage(0.1)).toBe('10%');
      expect(formatPercentage(1)).toBe('100%');
    });

    test('should handle custom decimal places', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.1, 1)).toBe('10.0%');
    });
  });

  describe('formatDuration', () => {
    test('should format durations correctly', () => {
      expect(formatDuration(3661)).toBe('1h 1m 1s');
      expect(formatDuration(300)).toBe('5m 0s');
      expect(formatDuration(45)).toBe('45s');
    });

    test('should handle different formats', () => {
      expect(formatDuration(3661, 'short')).toBe('1h 1m 1s');
      expect(formatDuration(3661, 'long')).toBe('1 hour 1 minute 1 second');
    });
  });

  describe('truncateText', () => {
    const longText = 'This is a very long text that should be truncated';

    test('should truncate text correctly', () => {
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
    });

    test('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    test('should handle custom ellipsis', () => {
      expect(truncateText(longText, 20, '...')).toBe('This is a very lo...');
      expect(truncateText(longText, 20, ' [more]')).toBe('This is a ver [more]');
    });
  });

  describe('capitalizeFirst', () => {
    test('should capitalize first letter', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world');
      expect(capitalizeFirst('HELLO WORLD')).toBe('Hello world');
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('capitalizeWords', () => {
    test('should capitalize all words', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    test('should handle edge cases', () => {
      expect(capitalizeWords('')).toBe('');
      expect(capitalizeWords('a')).toBe('A');
    });
  });

  describe('formatAddress', () => {
    test('should format complete addresses', () => {
      const address = {
        line1: '123 Main Street',
        line2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      };

      const formatted = formatAddress(address);
      expect(formatted).toBe('123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001, India');
    });

    test('should handle partial addresses', () => {
      const address = {
        line1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      };

      const formatted = formatAddress(address, { includeCountry: false });
      expect(formatted).toBe('123 Main Street, Mumbai, Maharashtra 400001');
    });
  });

  describe('formatVehicleNumber', () => {
    test('should format vehicle numbers correctly', () => {
      expect(formatVehicleNumber('MH12AB1234')).toBe('MH 12 AB 1234');
      expect(formatVehicleNumber('DL01CA9999')).toBe('DL 01 CA 9999');
      expect(formatVehicleNumber('KA051234')).toBe('KA 05 1234');
    });

    test('should handle already formatted numbers', () => {
      expect(formatVehicleNumber('MH 12 AB 1234')).toBe('MH 12 AB 1234');
    });

    test('should handle lowercase input', () => {
      expect(formatVehicleNumber('mh12ab1234')).toBe('MH 12 AB 1234');
    });

    test('should handle 8 character old format', () => {
      expect(formatVehicleNumber('AP05BG12')).toBe('AP 05 BG12');
    });

    test('should handle invalid lengths', () => {
      expect(formatVehicleNumber('ABC123')).toBe('ABC123'); // Too short
      expect(formatVehicleNumber('VERYLONGVEHICLENUMBER')).toBe('VERYLONGVEHICLENUMBER'); // Too long
    });
  });

  describe('getRelativeTime', () => {
    test('should format relative time correctly', () => {
      const now = new Date();
      
      // Just now
      expect(getRelativeTime(new Date(now.getTime() - 30 * 1000))).toBe('Just now');
      
      // Minutes ago
      expect(getRelativeTime(new Date(now.getTime() - 5 * 60 * 1000))).toBe('5 minutes ago');
      expect(getRelativeTime(new Date(now.getTime() - 1 * 60 * 1000))).toBe('1 minute ago');
      
      // Hours ago
      expect(getRelativeTime(new Date(now.getTime() - 2 * 60 * 60 * 1000))).toBe('2 hours ago');
      expect(getRelativeTime(new Date(now.getTime() - 1 * 60 * 60 * 1000))).toBe('1 hour ago');
      
      // Days ago
      expect(getRelativeTime(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000))).toBe('1 day ago');
      expect(getRelativeTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))).toBe('3 days ago');
    });

    test('should use formatDate for week+ old dates', () => {
      const now = new Date();
      const weekOld = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const result = getRelativeTime(weekOld);
      expect(result).not.toContain('ago'); // Should be a formatted date
    });
  });

  describe('getInitials', () => {
    test('should get initials from names', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John')).toBe('J');
      expect(getInitials('John Middle Doe')).toBe('JD'); // First and last only
      expect(getInitials('')).toBe('U'); // Unknown
      expect(getInitials('   ')).toBe(''); // Empty after trim and split
    });

    test('should handle edge cases', () => {
      expect(getInitials('a')).toBe('A');
      expect(getInitials('john doe smith')).toBe('JS'); // First and last
    });
  });

  describe('formatDate edge cases', () => {
    test('should handle invalid dates', () => {
      expect(formatDate('invalid date')).toBe('Invalid Date');
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });

    test('should handle custom format strings', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('15/03/2024');
      expect(formatDate(date, 'MMMM d, yyyy')).toContain('March');
      expect(formatDate(date, 'long')).toContain('March');
      expect(formatDate(date, 'short')).toContain('Mar');
    });
  });

  describe('formatAddress string input', () => {
    test('should handle string addresses', () => {
      expect(formatAddress('123 Main St, City')).toBe('123 Main St, City');
    });

    test('should handle empty fields', () => {
      const address = {
        line1: '123 Main Street',
        line2: '',
        city: 'Mumbai',
        state: '',
        pincode: '400001'
      };
      expect(formatAddress(address)).toBe('123 Main Street, Mumbai, 400001');
    });
  });
});