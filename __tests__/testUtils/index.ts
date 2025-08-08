import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';
import { SocietyProvider } from '../../contexts/SocietyContext';

// Mock contexts for testing
export const mockAuthContext = {
  isAuthenticated: true,
  user: {
    id: 'test-user-123',
    fullName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '9876543210',
    societyCode: 'TEST123',
    flatNumber: 'A-101',
    role: 'resident' as const,
  },
  login: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  loading: false,
  error: null,
};

export const mockAdminContext = {
  isAdminMode: false,
  adminUser: null,
  adminSessions: [],
  currentSociety: {
    id: 'society-1',
    name: 'Test Society',
    code: 'TEST123',
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
  },
  toggleAdminMode: jest.fn(),
  switchSociety: jest.fn(),
  hasPermission: jest.fn((permission) => true),
  canPerformAction: jest.fn((action) => true),
  loading: false,
  error: null,
};

export const mockSocietyContext = {
  societies: [
    {
      id: 'society-1',
      name: 'Test Society',
      code: 'TEST123',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
    },
  ],
  currentSociety: {
    id: 'society-1',
    name: 'Test Society',
    code: 'TEST123',
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
  },
  setSociety: jest.fn(),
  loading: false,
  error: null,
};

// Mock context providers
jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

jest.mock('../../contexts/AdminContext', () => ({
  AdminProvider: ({ children }: { children: React.ReactNode }) => children,
  useAdmin: () => mockAdminContext,
}));

jest.mock('../../contexts/SocietyContext', () => ({
  SocietyProvider: ({ children }: { children: React.ReactNode }) => children,
  useSociety: () => mockSocietyContext,
}));

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean;
  withAdmin?: boolean;
  withSociety?: boolean;
  authContext?: Partial<typeof mockAuthContext>;
  adminContext?: Partial<typeof mockAdminContext>;
  societyContext?: Partial<typeof mockSocietyContext>;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) => {
  const {
    withAuth = true,
    withAdmin = false,
    withSociety = false,
    authContext = {},
    adminContext = {},
    societyContext = {},
    ...renderOptions
  } = options;

  // Update mock contexts with provided overrides
  Object.assign(mockAuthContext, authContext);
  Object.assign(mockAdminContext, adminContext);
  Object.assign(mockSocietyContext, societyContext);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    let component = children;

    if (withSociety) {
      component = React.createElement(SocietyProvider, {}, component);
    }

    if (withAdmin) {
      component = React.createElement(AdminProvider, {}, component);
    }

    if (withAuth) {
      component = React.createElement(AuthProvider, {}, component);
    }

    return component as React.ReactElement;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to create admin user for testing
export const createMockAdminUser = (overrides = {}) => ({
  id: 'admin-123',
  email: 'admin@test.com',
  fullName: 'Test Admin',
  role: 'community_manager' as const,
  societies: ['society-1'],
  permissions: ['read', 'write', 'delete'],
  isActive: true,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create society data for testing
export const createMockSociety = (overrides = {}) => ({
  id: 'society-1',
  name: 'Test Society',
  code: 'TEST123',
  address: 'Test Address',
  city: 'Test City',
  state: 'Test State',
  pincode: '123456',
  totalFlats: 100,
  occupiedFlats: 80,
  adminUsers: ['admin-123'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to test admin permissions
export const testAdminPermissions = (
  component: React.ReactElement,
  requiredPermissions: string[],
) => {
  // Test with permissions
  const withPermissions = renderWithProviders(component, {
    withAuth: true,
    withAdmin: true,
    adminContext: {
      isAdminMode: true,
      adminUser: createMockAdminUser(),
      hasPermission: jest.fn((permission) =>
        requiredPermissions.includes(permission),
      ),
    },
  });

  // Test without permissions
  const withoutPermissions = renderWithProviders(component, {
    withAuth: true,
    withAdmin: true,
    adminContext: {
      isAdminMode: true,
      adminUser: createMockAdminUser(),
      hasPermission: jest.fn(() => false),
    },
  });

  return { withPermissions, withoutPermissions };
};

// Helper to test multi-society scenarios
export const testMultiSociety = (
  component: React.ReactElement,
  societies = [
    createMockSociety(),
    createMockSociety({ id: 'society-2', name: 'Second Society' }),
  ],
) => {
  return renderWithProviders(component, {
    withAuth: true,
    withAdmin: true,
    withSociety: true,
    societyContext: {
      societies,
      currentSociety: societies[0],
    },
    adminContext: {
      isAdminMode: true,
      adminUser: createMockAdminUser({ societies: societies.map((s) => s.id) }),
      currentSociety: societies[0],
    },
  });
};

// Helper functions for common test scenarios
export const waitForLoadingToFinish = async () => {
  // Wait for any async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export const mockApiResponse = (data: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay);
  });
};

export const mockApiError = (error: any, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

// Form testing helpers
export const fillFormField = async (
  getByTestId: any,
  testId: string,
  value: string,
) => {
  const input = getByTestId(testId);
  // Simulate user typing
  input.props.onChangeText(value);
  return input;
};

export const submitForm = async (
  getByTestId: any,
  submitButtonTestId = 'submit-button',
) => {
  const submitButton = getByTestId(submitButtonTestId);
  submitButton.props.onPress();
  return submitButton;
};

// Mock API client for service testing
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(), 
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Mock Zustand store creators
export const createMockStore = (initialState = {}) => {
  const listeners = new Set();
  const state = { ...initialState };
  
  return {
    getState: () => state,
    setState: (partial, replace = false) => {
      Object.assign(state, typeof partial === 'function' ? partial(state) : partial);
      listeners.forEach(listener => listener(state, state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => listeners.clear(),
  };
};

// Mock navigation for screen testing
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(() => false),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

// Mock route for screen testing
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Performance testing helpers
export const measureRenderTime = async (renderFunction) => {
  const start = Date.now();
  const result = renderFunction();
  
  // Wait for component to mount
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const end = Date.now();
  return {
    renderTime: end - start,
    result,
  };
};

// Memory leak detection
export const detectMemoryLeaks = (renderFunction, iterations = 100) => {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const { result } = renderFunction();
    result.unmount();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    results.push({
      iteration: i,
      memoryUsage: process.memoryUsage(),
    });
  }
  
  return results;
};

// Network state mocking
export const mockNetworkState = (isConnected = true, type = 'wifi') => {
  const NetInfo = require('@react-native-community/netinfo');
  NetInfo.fetch.mockResolvedValue({
    isConnected,
    isInternetReachable: isConnected,
    type,
  });
};

// Async utility for waiting for state changes
export const waitForStateChange = (getState, condition, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const check = () => {
      if (condition(getState())) {
        resolve(getState());
        return;
      }
      
      if (Date.now() - start > timeout) {
        reject(new Error(`Timeout waiting for state change: ${condition.toString()}`));
        return;
      }
      
      setTimeout(check, 50);
    };
    
    check();
  });
};

// Error boundary testing
export const TestErrorBoundary = ({ children, onError = jest.fn() }) => {
  return React.createElement(
    class extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      
      componentDidCatch(error, errorInfo) {
        onError(error, errorInfo);
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {}, 'Something went wrong.');
        }
        
        return this.props.children;
      }
    },
    {},
    children
  );
};

// Mock timer utilities
export const mockTimers = () => {
  jest.useFakeTimers();
  return {
    advanceTimersByTime: jest.advanceTimersByTime,
    runOnlyPendingTimers: jest.runOnlyPendingTimers,
    runAllTimers: jest.runAllTimers,
    clearAllTimers: jest.clearAllTimers,
    restore: () => jest.useRealTimers(),
  };
};

// Component accessibility testing
export const testAccessibility = (component) => {
  const { getByRole, getByLabelText, getAllByRole } = render(component);
  
  return {
    hasAccessibleLabel: (testId) => {
      try {
        getByLabelText(testId);
        return true;
      } catch {
        return false;
      }
    },
    hasRole: (role) => {
      try {
        getByRole(role);
        return true;
      } catch {
        return false;
      }
    },
    getAllElementsWithRole: (role) => {
      try {
        return getAllByRole(role);
      } catch {
        return [];
      }
    },
  };
};

// Re-export everything from @testing-library/react-native for convenience
export * from '@testing-library/react-native';
