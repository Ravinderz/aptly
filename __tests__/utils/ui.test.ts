import {
  getDeviceDimensions,
  getSafeAreaTop,
  getAvatarColor,
  getPriorityColors,
  getStatusColors,
  getCardGradient,
  getIconSize,
  getSpacing,
  triggerHaptic,
  getAccessibilityLabel,
  isDarkMode,
  getShadowStyle,
} from '../../utils/ui';
import { Dimensions, Platform, StatusBar } from 'react-native';

// Mock React Native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
  StatusBar: {
    currentHeight: 24,
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('UI Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockDimensions.get.mockImplementation((dim) => {
      if (dim === 'window') {
        return { width: 375, height: 812 };
      }
      if (dim === 'screen') {
        return { width: 375, height: 812, scale: 3, fontScale: 1 };
      }
      return { width: 375, height: 812 };
    });
  });

  describe('getDeviceDimensions', () => {
    test('should return window and screen dimensions', () => {
      const result = getDeviceDimensions();

      expect(mockDimensions.get).toHaveBeenCalledWith('window');
      expect(mockDimensions.get).toHaveBeenCalledWith('screen');
      expect(result.window).toEqual({ width: 375, height: 812 });
      expect(result.screen).toEqual({
        width: 375,
        height: 812,
        scale: 3,
        fontScale: 1,
      });
    });

    test('should detect small device (width < 375)', () => {
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 320, height: 568 };
        return { width: 320, height: 568, scale: 2, fontScale: 1 };
      });

      const result = getDeviceDimensions();
      expect(result.isSmallDevice).toBe(true);
      expect(result.isTablet).toBe(false);
    });

    test('should detect regular device (width >= 375)', () => {
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 375, height: 812 };
        return { width: 375, height: 812, scale: 3, fontScale: 1 };
      });

      const result = getDeviceDimensions();
      expect(result.isSmallDevice).toBe(false);
      expect(result.isTablet).toBe(false);
    });

    test('should detect tablet (width >= 768)', () => {
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 768, height: 1024 };
        return { width: 768, height: 1024, scale: 2, fontScale: 1 };
      });

      const result = getDeviceDimensions();
      expect(result.isSmallDevice).toBe(false);
      expect(result.isTablet).toBe(true);
    });

    test('should handle edge case at tablet boundary', () => {
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 767, height: 1024 };
        return { width: 767, height: 1024, scale: 2, fontScale: 1 };
      });

      const result = getDeviceDimensions();
      expect(result.isTablet).toBe(false);
    });
  });

  describe('getSafeAreaTop', () => {
    test('should return StatusBar height for Android', () => {
      Platform.OS = 'android';
      StatusBar.currentHeight = 24;

      const result = getSafeAreaTop();
      expect(result).toBe(24);
    });

    test('should return 0 for iOS', () => {
      Platform.OS = 'ios';

      const result = getSafeAreaTop();
      expect(result).toBe(0);
    });

    test('should handle undefined StatusBar height on Android', () => {
      Platform.OS = 'android';
      StatusBar.currentHeight = undefined;

      const result = getSafeAreaTop();
      expect(result).toBe(0);
    });

    test('should handle null StatusBar height on Android', () => {
      Platform.OS = 'android';
      StatusBar.currentHeight = null as any;

      const result = getSafeAreaTop();
      expect(result).toBe(0);
    });
  });

  describe('getAvatarColor', () => {
    test('should return consistent color for same name', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('John Doe');
      expect(color1).toBe(color2);
    });

    test('should return different colors for different names', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('Jane Smith');
      expect(color1).not.toBe(color2);
    });

    test('should handle empty string', () => {
      const color = getAvatarColor('');
      expect(color).toBe('bg-primary'); // First color in array
    });

    test('should return valid Tailwind classes', () => {
      const validColors = [
        'bg-primary',
        'bg-secondary',
        'bg-warning',
        'bg-error/80',
        'bg-primary/80',
        'bg-secondary/80',
      ];

      const color = getAvatarColor('Test User');
      expect(validColors).toContain(color);
    });

    test('should handle special characters in name', () => {
      const color1 = getAvatarColor('José María');
      const color2 = getAvatarColor('李小明');
      const color3 = getAvatarColor('user@email.com');

      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
      expect(color3).toBeDefined();
    });

    test('should distribute colors across all options', () => {
      const names = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'AA',
        'BB',
        'CC',
        'DD',
        'EE',
        'FF',
        'GG',
        'HH',
        'II',
        'JJ',
      ];

      const colors = names.map((name) => getAvatarColor(name));
      const uniqueColors = new Set(colors);

      // Should have multiple unique colors (not just one)
      expect(uniqueColors.size).toBeGreaterThan(1);
    });
  });

  describe('getPriorityColors', () => {
    test('should return emergency colors', () => {
      const colors = getPriorityColors('emergency');
      expect(colors).toEqual({
        background: 'bg-error',
        text: 'text-white',
        border: 'border-error',
        icon: 'text-error',
      });
    });

    test('should return high priority colors', () => {
      const colors = getPriorityColors('high');
      expect(colors).toEqual({
        background: 'bg-warning',
        text: 'text-white',
        border: 'border-warning',
        icon: 'text-warning',
      });
    });

    test('should return medium priority colors', () => {
      const colors = getPriorityColors('medium');
      expect(colors).toEqual({
        background: 'bg-primary',
        text: 'text-white',
        border: 'border-primary',
        icon: 'text-primary',
      });
    });

    test('should return low priority colors', () => {
      const colors = getPriorityColors('low');
      expect(colors).toEqual({
        background: 'bg-secondary',
        text: 'text-white',
        border: 'border-secondary',
        icon: 'text-secondary',
      });
    });

    test('should default to low priority colors for invalid input', () => {
      // @ts-ignore - testing invalid input
      const colors = getPriorityColors('invalid');
      expect(colors).toEqual({
        background: 'bg-secondary',
        text: 'text-white',
        border: 'border-secondary',
        icon: 'text-secondary',
      });
    });
  });

  describe('getStatusColors', () => {
    test('should return success colors for positive statuses', () => {
      const successStatuses = [
        'approved',
        'completed',
        'success',
        'active',
        'paid',
      ];

      successStatuses.forEach((status) => {
        const colors = getStatusColors(status);
        expect(colors).toEqual({
          background: 'bg-secondary/10',
          text: 'text-secondary',
          border: 'border-secondary',
        });
      });
    });

    test('should return warning colors for pending statuses', () => {
      const pendingStatuses = ['pending', 'in-progress', 'processing'];

      pendingStatuses.forEach((status) => {
        const colors = getStatusColors(status);
        expect(colors).toEqual({
          background: 'bg-warning/10',
          text: 'text-warning',
          border: 'border-warning',
        });
      });
    });

    test('should return error colors for negative statuses', () => {
      const errorStatuses = [
        'rejected',
        'failed',
        'error',
        'cancelled',
        'overdue',
      ];

      errorStatuses.forEach((status) => {
        const colors = getStatusColors(status);
        expect(colors).toEqual({
          background: 'bg-error/10',
          text: 'text-error',
          border: 'border-error',
        });
      });
    });

    test('should return default colors for unknown statuses', () => {
      const unknownStatuses = ['unknown', 'draft', 'new', 'custom'];

      unknownStatuses.forEach((status) => {
        const colors = getStatusColors(status);
        expect(colors).toEqual({
          background: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary',
        });
      });
    });

    test('should handle case insensitive input', () => {
      const upperColors = getStatusColors('APPROVED');
      const lowerColors = getStatusColors('approved');
      const mixedColors = getStatusColors('Approved');

      expect(upperColors).toEqual(lowerColors);
      expect(lowerColors).toEqual(mixedColors);
    });

    test('should handle empty string', () => {
      const colors = getStatusColors('');
      expect(colors).toEqual({
        background: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary',
      });
    });
  });

  describe('getCardGradient', () => {
    test('should return correct gradient for each card type', () => {
      expect(getCardGradient('primary')).toBe(
        'bg-gradient-to-br from-primary/5 to-primary/10',
      );
      expect(getCardGradient('secondary')).toBe(
        'bg-gradient-to-br from-secondary/5 to-secondary/10',
      );
      expect(getCardGradient('success')).toBe(
        'bg-gradient-to-br from-secondary/5 to-secondary/10',
      );
      expect(getCardGradient('warning')).toBe(
        'bg-gradient-to-br from-warning/5 to-warning/10',
      );
      expect(getCardGradient('error')).toBe(
        'bg-gradient-to-br from-error/5 to-error/10',
      );
    });

    test('should return default surface for invalid type', () => {
      // @ts-ignore - testing invalid input
      expect(getCardGradient('invalid')).toBe('bg-surface');
    });

    test('should handle success type (uses secondary colors)', () => {
      const successGradient = getCardGradient('success');
      const secondaryGradient = getCardGradient('secondary');
      expect(successGradient).toBe(secondaryGradient);
    });
  });

  describe('getIconSize', () => {
    test('should return correct sizes for each option', () => {
      expect(getIconSize('sm')).toBe(16);
      expect(getIconSize('md')).toBe(20);
      expect(getIconSize('lg')).toBe(24);
      expect(getIconSize('xl')).toBe(28);
    });

    test('should return default size for invalid input', () => {
      // @ts-ignore - testing invalid input
      expect(getIconSize('invalid')).toBe(20);
    });

    test('should return numbers for all valid inputs', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const result = getIconSize(size);
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('getSpacing', () => {
    test('should calculate spacing based on 8px units', () => {
      expect(getSpacing(0)).toBe(0);
      expect(getSpacing(1)).toBe(8);
      expect(getSpacing(2)).toBe(16);
      expect(getSpacing(3)).toBe(24);
      expect(getSpacing(4)).toBe(32);
      expect(getSpacing(0.5)).toBe(4);
    });

    test('should handle negative multipliers', () => {
      expect(getSpacing(-1)).toBe(-8);
      expect(getSpacing(-2)).toBe(-16);
    });

    test('should handle decimal multipliers', () => {
      expect(getSpacing(1.5)).toBe(12);
      expect(getSpacing(2.5)).toBe(20);
    });

    test('should handle large multipliers', () => {
      expect(getSpacing(10)).toBe(80);
      expect(getSpacing(100)).toBe(800);
    });
  });

  describe('triggerHaptic', () => {
    test('should log haptic feedback type', () => {
      triggerHaptic('light');
      expect(mockConsoleLog).toHaveBeenCalledWith('Haptic feedback: light');
    });

    test('should handle all haptic types', () => {
      const hapticTypes: Array<
        'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
      > = ['light', 'medium', 'heavy', 'success', 'warning', 'error'];

      hapticTypes.forEach((type) => {
        triggerHaptic(type);
        expect(mockConsoleLog).toHaveBeenCalledWith(`Haptic feedback: ${type}`);
      });

      expect(mockConsoleLog).toHaveBeenCalledTimes(hapticTypes.length);
    });

    test('should not throw for any haptic type', () => {
      expect(() => triggerHaptic('light')).not.toThrow();
      expect(() => triggerHaptic('medium')).not.toThrow();
      expect(() => triggerHaptic('heavy')).not.toThrow();
      expect(() => triggerHaptic('success')).not.toThrow();
      expect(() => triggerHaptic('warning')).not.toThrow();
      expect(() => triggerHaptic('error')).not.toThrow();
    });
  });

  describe('getAccessibilityLabel', () => {
    test('should combine element and content', () => {
      const label = getAccessibilityLabel('button', 'Save changes');
      expect(label).toBe('button, Save changes');
    });

    test('should include state when provided', () => {
      const label = getAccessibilityLabel('button', 'Save changes', 'enabled');
      expect(label).toBe('button, Save changes, enabled');
    });

    test('should handle empty strings', () => {
      const label = getAccessibilityLabel('', '');
      expect(label).toBe(', ');
    });

    test('should handle state being undefined', () => {
      const label = getAccessibilityLabel('link', 'Go to home');
      expect(label).toBe('link, Go to home');
    });

    test('should handle complex descriptions', () => {
      const label = getAccessibilityLabel(
        'text input',
        'Enter your phone number',
        'required, focused',
      );
      expect(label).toBe(
        'text input, Enter your phone number, required, focused',
      );
    });

    test('should handle special characters', () => {
      const label = getAccessibilityLabel(
        'button',
        'Delete "My Document"',
        'destructive',
      );
      expect(label).toBe('button, Delete "My Document", destructive');
    });
  });

  describe('isDarkMode', () => {
    test('should return false (light theme)', () => {
      const result = isDarkMode();
      expect(result).toBe(false);
    });

    test('should consistently return boolean', () => {
      const result1 = isDarkMode();
      const result2 = isDarkMode();

      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
      expect(result1).toBe(result2);
    });
  });

  describe('getShadowStyle', () => {
    test('should return correct shadow styles for each elevation', () => {
      expect(getShadowStyle(0)).toBe('');
      expect(getShadowStyle(1)).toBe('shadow-sm shadow-black/5');
      expect(getShadowStyle(2)).toBe('shadow shadow-black/10');
      expect(getShadowStyle(3)).toBe('shadow-md shadow-black/15');
      expect(getShadowStyle(4)).toBe('shadow-lg shadow-black/20');
      expect(getShadowStyle(5)).toBe('shadow-xl shadow-black/25');
    });

    test('should return default shadow for invalid elevation', () => {
      expect(getShadowStyle(6)).toBe('shadow shadow-black/10');
      expect(getShadowStyle(-1)).toBe('shadow shadow-black/10');
      expect(getShadowStyle(100)).toBe('shadow shadow-black/10');
    });

    test('should handle decimal elevations', () => {
      expect(getShadowStyle(2.5)).toBe('shadow shadow-black/10'); // Falls to default
      expect(getShadowStyle(1.9)).toBe('shadow shadow-black/10'); // Falls to default
    });

    test('should return strings for all inputs', () => {
      for (let i = 0; i <= 5; i++) {
        const result = getShadowStyle(i);
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('integration and edge cases', () => {
    test('should handle platform-specific behavior consistently', () => {
      Platform.OS = 'android';
      const androidSafeArea = getSafeAreaTop();

      Platform.OS = 'ios';
      const iosSafeArea = getSafeAreaTop();

      expect(typeof androidSafeArea).toBe('number');
      expect(typeof iosSafeArea).toBe('number');
    });

    test('should maintain consistent avatar colors across multiple calls', () => {
      const testNames = ['Alice', 'Bob', 'Charlie', 'Diana'];

      // Get colors first time
      const firstRun = testNames.map((name) => getAvatarColor(name));

      // Get colors second time
      const secondRun = testNames.map((name) => getAvatarColor(name));

      expect(firstRun).toEqual(secondRun);
    });

    test('should handle extreme screen dimensions', () => {
      // Very small screen
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 200, height: 400 };
        return { width: 200, height: 400, scale: 1, fontScale: 1 };
      });

      let result = getDeviceDimensions();
      expect(result.isSmallDevice).toBe(true);
      expect(result.isTablet).toBe(false);

      // Very large screen
      mockDimensions.get.mockImplementation((dim) => {
        if (dim === 'window') return { width: 1200, height: 1600 };
        return { width: 1200, height: 1600, scale: 1, fontScale: 1 };
      });

      result = getDeviceDimensions();
      expect(result.isSmallDevice).toBe(false);
      expect(result.isTablet).toBe(true);
    });

    test('should provide consistent UI utility outputs', () => {
      // Test that functions return consistent types and formats
      expect(typeof getSpacing(2)).toBe('number');
      expect(typeof getIconSize('md')).toBe('number');
      expect(typeof getAvatarColor('test')).toBe('string');
      expect(typeof getShadowStyle(2)).toBe('string');
      expect(typeof getCardGradient('primary')).toBe('string');
      expect(typeof isDarkMode()).toBe('boolean');
    });
  });
});
