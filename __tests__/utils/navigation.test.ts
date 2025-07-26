import {
  resetNavigationAndNavigate,
  navigateWithReset,
  safeGoBack
} from '../../utils/navigation';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn()
  }
}));

const mockRouter = router as jest.Mocked<typeof router>;

describe('Navigation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('resetNavigationAndNavigate', () => {
    test('should navigate to home tabs first', () => {
      resetNavigationAndNavigate('/test-path');
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });

    test('should navigate to target path after delay', () => {
      const targetPath = '/services/maintenance';
      resetNavigationAndNavigate(targetPath);
      
      // Initially only home navigation should be called
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      
      // Fast-forward through the timeout
      jest.advanceTimersByTime(50);
      
      // Now target path should be called
      expect(mockRouter.push).toHaveBeenCalledWith(targetPath);
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
    });

    test('should use 50ms delay for navigation timing', () => {
      const targetPath = '/community/posts';
      resetNavigationAndNavigate(targetPath);
      
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      
      // Advance by less than 50ms - second navigation shouldn't happen yet
      jest.advanceTimersByTime(30);
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      
      // Advance to 50ms - second navigation should happen
      jest.advanceTimersByTime(20);
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
      expect(mockRouter.push).toHaveBeenLastCalledWith(targetPath);
    });

    test('should handle string paths', () => {
      resetNavigationAndNavigate('/settings/profile');
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      jest.advanceTimersByTime(50);
      expect(mockRouter.push).toHaveBeenCalledWith('/settings/profile');
    });

    test('should handle object paths', () => {
      const pathObject = { pathname: '/services', params: { tab: 'maintenance' } };
      resetNavigationAndNavigate(pathObject);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      jest.advanceTimersByTime(50);
      expect(mockRouter.push).toHaveBeenCalledWith(pathObject);
    });

    test('should handle null or undefined paths', () => {
      resetNavigationAndNavigate(null);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      jest.advanceTimersByTime(50);
      expect(mockRouter.push).toHaveBeenCalledWith(null);
    });

    test('should handle multiple rapid calls correctly', () => {
      resetNavigationAndNavigate('/path1');
      resetNavigationAndNavigate('/path2');
      
      // Both should call home navigation immediately
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      expect(mockRouter.push).toHaveBeenCalledTimes(2);
      
      // Advance timers to trigger delayed navigation
      jest.advanceTimersByTime(50);
      
      // Both target paths should be called
      expect(mockRouter.push).toHaveBeenCalledWith('/path1');
      expect(mockRouter.push).toHaveBeenCalledWith('/path2');
      expect(mockRouter.push).toHaveBeenCalledTimes(4);
    });
  });

  describe('navigateWithReset', () => {
    test('should use replace instead of push', () => {
      const targetPath = '/settings/security';
      navigateWithReset(targetPath);
      
      expect(mockRouter.replace).toHaveBeenCalledWith(targetPath);
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    test('should handle string paths', () => {
      navigateWithReset('/visitor/addVisitor');
      expect(mockRouter.replace).toHaveBeenCalledWith('/visitor/addVisitor');
    });

    test('should handle object paths', () => {
      const pathObject = { pathname: '/community', params: { category: 'announcements' } };
      navigateWithReset(pathObject);
      expect(mockRouter.replace).toHaveBeenCalledWith(pathObject);
    });

    test('should handle null or undefined paths', () => {
      navigateWithReset(undefined);
      expect(mockRouter.replace).toHaveBeenCalledWith(undefined);
    });

    test('should not involve any timing delays', () => {
      navigateWithReset('/immediate-path');
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/immediate-path');
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      
      // Advance timers to ensure no delayed actions
      jest.advanceTimersByTime(100);
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });

    test('should reset navigation history by using replace', () => {
      // This is the key behavior - replace doesn't accumulate history
      navigateWithReset('/new-root');
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/new-root');
      expect(mockRouter.push).not.toHaveBeenCalled(); // Should not use push
    });
  });

  describe('safeGoBack', () => {
    test('should go back when navigation history exists', () => {
      mockRouter.canGoBack.mockReturnValue(true);
      
      safeGoBack();
      
      expect(mockRouter.canGoBack).toHaveBeenCalled();
      expect(mockRouter.back).toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    test('should navigate to fallback when no history exists', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      safeGoBack();
      
      expect(mockRouter.canGoBack).toHaveBeenCalled();
      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });

    test('should use default fallback path when not specified', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      safeGoBack();
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });

    test('should use custom fallback path when specified', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      safeGoBack('/custom/fallback');
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/custom/fallback');
    });

    test('should handle custom fallback as object', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      const fallbackObject = { pathname: '/home', params: { tab: 'dashboard' } };
      safeGoBack(fallbackObject);
      
      expect(mockRouter.replace).toHaveBeenCalledWith(fallbackObject);
    });

    test('should prioritize going back over fallback when possible', () => {
      mockRouter.canGoBack.mockReturnValue(true);
      
      safeGoBack('/should-not-be-used');
      
      expect(mockRouter.back).toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    test('should handle multiple consecutive calls correctly', () => {
      // First call - can go back
      mockRouter.canGoBack.mockReturnValue(true);
      safeGoBack();
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
      
      // Second call - cannot go back
      mockRouter.canGoBack.mockReturnValue(false);
      safeGoBack('/fallback');
      expect(mockRouter.back).toHaveBeenCalledTimes(1); // Still 1
      expect(mockRouter.replace).toHaveBeenCalledWith('/fallback');
    });

    test('should handle null fallback path', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      safeGoBack(null);
      
      expect(mockRouter.replace).toHaveBeenCalledWith(null);
    });

    test('should handle undefined fallback path (uses default)', () => {
      mockRouter.canGoBack.mockReturnValue(false);
      
      safeGoBack(undefined);
      
      // When undefined is passed, the default parameter value is used
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('integration behavior', () => {
    test('should work correctly when chaining navigation operations', () => {
      // Simulate a complex navigation flow
      mockRouter.canGoBack.mockReturnValue(true);
      
      // First, try safe go back
      safeGoBack();
      expect(mockRouter.back).toHaveBeenCalled();
      
      // Then navigate with reset
      navigateWithReset('/new-section');
      expect(mockRouter.replace).toHaveBeenCalledWith('/new-section');
      
      // Finally, reset and navigate
      resetNavigationAndNavigate('/final-destination');
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      
      jest.advanceTimersByTime(50);
      expect(mockRouter.push).toHaveBeenCalledWith('/final-destination');
    });

    test('should handle edge cases with router state', () => {
      // Test when canGoBack throws an error (edge case)
      mockRouter.canGoBack.mockImplementation(() => {
        throw new Error('Router error');
      });
      
      expect(() => safeGoBack()).toThrow('Router error');
      
      // Reset mock for normal behavior
      mockRouter.canGoBack.mockReturnValue(false);
      safeGoBack();
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });

    test('should maintain type safety with any path types', () => {
      // Test that functions accept 'any' type as documented
      const stringPath = '/string-path';
      const objectPath = { pathname: '/object-path' };
      const numberPath = 123; // Edge case - any type
      
      resetNavigationAndNavigate(stringPath);
      navigateWithReset(objectPath);
      safeGoBack(numberPath);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)');
      jest.advanceTimersByTime(50);
      expect(mockRouter.push).toHaveBeenCalledWith(stringPath);
      expect(mockRouter.replace).toHaveBeenCalledWith(objectPath);
      expect(mockRouter.replace).toHaveBeenCalledWith(numberPath);
    });
  });
});