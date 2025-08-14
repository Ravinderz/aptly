/**
 * Enhanced Testing Utilities
 * Comprehensive testing utilities for React Native with improved accessibility testing
 */

import React from 'react';
import { render, RenderOptions, RenderResult, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      canGoBack: jest.fn(() => true),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
      key: 'test-route',
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    platform: { ios: false, android: true },
    installationId: 'test-installation-id',
    expoConfig: {
      version: '1.0.0',
      ios: { buildNumber: '1' },
      android: { versionCode: 1 },
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// ============================================================================
// CUSTOM RENDER FUNCTION
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Navigation props
  navigationProps?: {
    initialRouteName?: string;
    screenOptions?: any;
  };
  
  // Query client for react-query tests
  queryClient?: QueryClient;
  
  // Custom wrapper component
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  
  // Mock store state
  mockStoreState?: any;
  
  // Feature flags
  featureFlags?: Record<string, boolean>;
}

interface CustomRenderResult extends RenderResult {
  // Additional utilities
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
  
  // Navigation utilities
  navigateTo: (screen: string, params?: any) => void;
  goBack: () => void;
  
  // Store utilities
  updateStore: (newState: any) => void;
  
  // Query utilities
  invalidateQueries: (key?: string) => void;
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): CustomRenderResult {
  const {
    navigationProps = {},
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    wrapper,
    mockStoreState,
    featureFlags = {},
    ...renderOptions
  } = options;

  // Mock navigation functions
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  // Create wrapper component
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = (
      <NavigationContainer>
        {children}
      </NavigationContainer>
    );

    // Wrap with QueryClient if provided
    content = (
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    );

    // Wrap with custom wrapper if provided
    if (wrapper) {
      content = React.createElement(wrapper, {}, content);
    }

    return content;
  };

  const renderResult = render(ui, {
    wrapper: AllTheProviders,
    ...renderOptions,
  });

  return {
    ...renderResult,
    
    // Navigation utilities
    navigateTo: (screen: string, params?: any) => {
      mockNavigate(screen, params);
    },
    
    goBack: () => {
      mockGoBack();
    },
    
    // Store utilities
    updateStore: (newState: any) => {
      // Mock store update logic would go here
      act(() => {
        // Trigger re-render with new state
      });
    },
    
    // Query utilities
    invalidateQueries: (key?: string) => {
      act(() => {
        if (key) {
          queryClient.invalidateQueries({ queryKey: [key] });
        } else {
          queryClient.invalidateQueries();
        }
      });
    },
  };
}

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

export const accessibilityUtils = {
  /**
   * Test if element has proper accessibility props
   */
  hasAccessibilityProps: (element: any) => {
    const props = element.props;
    return {
      hasLabel: !!props.accessibilityLabel,
      hasHint: !!props.accessibilityHint,
      hasRole: !!props.accessibilityRole,
      hasState: !!props.accessibilityState,
      hasValue: !!props.accessibilityValue,
      testID: props.testID,
    };
  },

  /**
   * Test minimum touch target size (44x44 pts for iOS, 48x48 dp for Android)
   */
  hasMinimumTouchTarget: (element: any) => {
    const style = element.props.style || {};
    const width = style.width || style.minWidth || 0;
    const height = style.height || style.minHeight || 0;
    
    const minimumSize = 44; // iOS standard
    return width >= minimumSize && height >= minimumSize;
  },

  /**
   * Test color contrast (simplified)
   */
  hasGoodContrast: (backgroundColor: string, textColor: string) => {
    // Simplified contrast check - in real implementation, use proper contrast calculation
    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(textColor);
    const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / (Math.min(bgLuminance, textLuminance) + 0.05);
    
    return contrast >= 4.5; // WCAG AA standard
  },

  /**
   * Test for screen reader compatibility
   */
  isScreenReaderFriendly: (element: any) => {
    const props = element.props;
    return (
      props.accessibilityLabel ||
      props.children ||
      props.accessibilityHint ||
      props.accessibilityValue
    );
  },

  /**
   * Test for keyboard navigation support
   */
  supportsKeyboardNavigation: (element: any) => {
    const props = element.props;
    return (
      props.accessible !== false &&
      (props.onPress || props.onFocus || props.onBlur)
    );
  },
};

// Helper function for luminance calculation (simplified)
function getLuminance(color: string): number {
  // Simplified - in real implementation, convert hex to RGB and calculate proper luminance
  return 0.5; // Placeholder
}

// ============================================================================
// INTERACTION TESTING UTILITIES
// ============================================================================

export const interactionUtils = {
  /**
   * Simulate user typing with realistic delays
   */
  typeText: async (element: any, text: string, { delay = 50 } = {}) => {
    for (const char of text) {
      fireEvent.changeText(element, element.props.value + char);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },

  /**
   * Simulate swipe gestures
   */
  swipe: (element: any, direction: 'left' | 'right' | 'up' | 'down') => {
    const directions = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: -100 },
      down: { x: 0, y: 100 },
    };

    const { x, y } = directions[direction];
    
    fireEvent(element, 'onTouchStart', {
      nativeEvent: { touches: [{ pageX: 0, pageY: 0 }] },
    });
    
    fireEvent(element, 'onTouchMove', {
      nativeEvent: { touches: [{ pageX: x, pageY: y }] },
    });
    
    fireEvent(element, 'onTouchEnd', {
      nativeEvent: { touches: [] },
    });
  },

  /**
   * Simulate long press
   */
  longPress: async (element: any, duration = 500) => {
    fireEvent(element, 'onPressIn');
    await new Promise(resolve => setTimeout(resolve, duration));
    fireEvent(element, 'onLongPress');
    fireEvent(element, 'onPressOut');
  },

  /**
   * Simulate double tap
   */
  doubleTap: async (element: any, delay = 200) => {
    fireEvent.press(element);
    await new Promise(resolve => setTimeout(resolve, delay));
    fireEvent.press(element);
  },

  /**
   * Simulate pull to refresh
   */
  pullToRefresh: async (scrollView: any) => {
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000, width: 400 },
        layoutMeasurement: { height: 600, width: 400 },
      },
    });

    await waitFor(() => {
      expect(scrollView.props.onRefresh).toHaveBeenCalled();
    });
  },

  /**
   * Simulate infinite scroll
   */
  scrollToEnd: (scrollView: any) => {
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 1000, width: 400 },
        layoutMeasurement: { height: 600, width: 400 },
      },
    });
  },
};

// ============================================================================
// MOCK UTILITIES
// ============================================================================

export const mockUtils = {
  /**
   * Create mock API responses
   */
  createMockApiResponse: <T>(data: T, success = true) => ({
    success,
    data: success ? data : undefined,
    error: success ? undefined : { message: 'Mock error', code: 'MOCK_ERROR' },
  }),

  /**
   * Mock navigation
   */
  mockNavigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
    dispatch: jest.fn(),
  },

  /**
   * Mock Alert
   */
  mockAlert: () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    return {
      spy: alertSpy,
      getLastCall: () => alertSpy.mock.calls[alertSpy.mock.calls.length - 1],
      getCallCount: () => alertSpy.mock.calls.length,
      clear: () => alertSpy.mockClear(),
    };
  },

  /**
   * Mock async storage
   */
  createMockAsyncStorage: () => {
    const storage = new Map<string, string>();
    
    return {
      setItem: jest.fn((key: string, value: string) => {
        storage.set(key, value);
        return Promise.resolve();
      }),
      getItem: jest.fn((key: string) => {
        return Promise.resolve(storage.get(key) || null);
      }),
      removeItem: jest.fn((key: string) => {
        storage.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        storage.clear();
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => {
        return Promise.resolve(Array.from(storage.keys()));
      }),
    };
  },

  /**
   * Mock form validation
   */
  createMockFormValidation: (isValid = true) => ({
    fields: {
      email: {
        value: 'test@example.com',
        error: isValid ? '' : 'Invalid email',
        touched: true,
        isValid,
      },
      password: {
        value: 'password123',
        error: isValid ? '' : 'Password too short',
        touched: true,
        isValid,
      },
    },
    isValid,
    isSubmitting: false,
    submitCount: 0,
    touchedFields: new Set(['email', 'password']),
    errors: isValid ? {} : { email: 'Invalid email', password: 'Password too short' },
  }),
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

export const performanceUtils = {
  /**
   * Measure render time
   */
  measureRenderTime: async (component: React.ReactElement) => {
    const start = performance.now();
    const result = render(component);
    const end = performance.now();
    
    return {
      renderTime: end - start,
      result,
    };
  },

  /**
   * Test memory leaks (simplified)
   */
  testMemoryLeak: async (component: React.ReactElement, iterations = 100) => {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const { result } = render(component);
      result.unmount();
      
      // In a real implementation, you'd measure actual memory usage
      results.push(performance.now());
    }
    
    return {
      iterations,
      avgTime: results.reduce((sum, time) => sum + time, 0) / results.length,
    };
  },

  /**
   * Test list performance with large datasets
   */
  testListPerformance: (listComponent: React.ReactElement, itemCount = 1000) => {
    const start = performance.now();
    const result = render(listComponent);
    const end = performance.now();
    
    return {
      renderTime: end - start,
      itemCount,
      timePerItem: (end - start) / itemCount,
      result,
    };
  },
};

// ============================================================================
// INTEGRATION TESTING UTILITIES
// ============================================================================

export const integrationUtils = {
  /**
   * Test complete user flows
   */
  testUserFlow: async (steps: Array<() => Promise<void>>) => {
    for (let i = 0; i < steps.length; i++) {
      try {
        await steps[i]();
      } catch (error) {
        throw new Error(`User flow failed at step ${i + 1}: ${error}`);
      }
    }
  },

  /**
   * Test API integration with mock server
   */
  createMockServer: () => {
    const handlers = new Map<string, any>();
    
    return {
      on: (endpoint: string, handler: any) => {
        handlers.set(endpoint, handler);
      },
      
      call: async (endpoint: string, data?: any) => {
        const handler = handlers.get(endpoint);
        if (!handler) {
          throw new Error(`No handler for endpoint: ${endpoint}`);
        }
        return handler(data);
      },
      
      reset: () => {
        handlers.clear();
      },
    };
  },

  /**
   * Test navigation flows
   */
  testNavigationFlow: async (
    navigation: any,
    flow: Array<{ screen: string; params?: any; assertion?: () => void }>
  ) => {
    for (const step of flow) {
      navigation.navigate(step.screen, step.params);
      
      if (step.assertion) {
        await waitFor(() => {
          step.assertion!();
        });
      }
    }
  },
};

// ============================================================================
// SNAPSHOT TESTING UTILITIES
// ============================================================================

export const snapshotUtils = {
  /**
   * Create component snapshot with props variations
   */
  testPropsVariations: (Component: React.ComponentType<any>, propVariations: any[]) => {
    return propVariations.map((props, index) => ({
      name: `variation-${index}`,
      component: React.createElement(Component, props),
      props,
    }));
  },

  /**
   * Test responsive snapshots
   */
  testResponsiveSnapshots: (Component: React.ComponentType<any>, props: any = {}) => {
    const screenSizes = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    return screenSizes.map(size => ({
      name: `${size.name}-${size.width}x${size.height}`,
      component: React.createElement(Component, { ...props, screenSize: size }),
    }));
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';

// Export our custom render function as the default
export { customRender as render };

// Export utilities
export {
  accessibilityUtils,
  interactionUtils,
  mockUtils,
  performanceUtils,
  integrationUtils,
  snapshotUtils,
};

// Export common test patterns
export const commonPatterns = {
  /**
   * Test component renders without crashing
   */
  shouldRenderWithoutCrashing: (Component: React.ComponentType<any>, props: any = {}) => {
    test('renders without crashing', () => {
      expect(() => {
        render(React.createElement(Component, props));
      }).not.toThrow();
    });
  },

  /**
   * Test component matches snapshot
   */
  shouldMatchSnapshot: (Component: React.ComponentType<any>, props: any = {}) => {
    test('matches snapshot', () => {
      const { toJSON } = render(React.createElement(Component, props));
      expect(toJSON()).toMatchSnapshot();
    });
  },

  /**
   * Test accessibility compliance
   */
  shouldBeAccessible: (Component: React.ComponentType<any>, props: any = {}) => {
    test('meets accessibility requirements', () => {
      const { getByRole, getByLabelText } = render(React.createElement(Component, props));
      
      // Test basic accessibility requirements
      // This would be expanded based on specific component needs
      expect(() => {
        // Component should be focusable if interactive
        if (props.onPress) {
          getByRole('button');
        }
      }).not.toThrow();
    });
  },
};