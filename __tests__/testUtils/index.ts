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
  options: CustomRenderOptions = {}
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
  requiredPermissions: string[]
) => {
  // Test with permissions
  const withPermissions = renderWithProviders(component, {
    withAuth: true,
    withAdmin: true,
    adminContext: {
      isAdminMode: true,
      adminUser: createMockAdminUser(),
      hasPermission: jest.fn((permission) => requiredPermissions.includes(permission)),
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
  societies = [createMockSociety(), createMockSociety({ id: 'society-2', name: 'Second Society' })]
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
      adminUser: createMockAdminUser({ societies: societies.map(s => s.id) }),
      currentSociety: societies[0],
    },
  });
};

// Helper functions for common test scenarios
export const waitForLoadingToFinish = async () => {
  // Wait for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 0));
};

export const mockApiResponse = (data: any, delay = 0) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data }), delay);
  });
};

export const mockApiError = (error: any, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

// Form testing helpers
export const fillFormField = async (getByTestId: any, testId: string, value: string) => {
  const input = getByTestId(testId);
  // Simulate user typing
  input.props.onChangeText(value);
  return input;
};

export const submitForm = async (getByTestId: any, submitButtonTestId = 'submit-button') => {
  const submitButton = getByTestId(submitButtonTestId);
  submitButton.props.onPress();
  return submitButton;
};

// Re-export everything from @testing-library/react-native for convenience
export * from '@testing-library/react-native';