# 🧪 Testing Framework Setup & Enhancement

## Overview
Comprehensive testing framework setup for React Native Expo app with TypeScript, focusing on admin module testing and overall code quality.

## 🎯 Testing Strategy

### Testing Pyramid
```
                 E2E Tests
                /         \
           Integration Tests
          /                 \
       Unit Tests (Component + Logic)
      /                               \
   Type Checking & Linting             \
  /                                     \
Static Analysis                    Documentation Tests
```

## 📋 Current Issues to Address

### TypeScript Errors (Priority: High)
- **Pattern 1**: `undefined` assignments to non-null types
- **Pattern 2**: Missing properties on interface objects  
- **Pattern 3**: Optional chaining needed for object access
- **Pattern 4**: Type mismatches in component props
- **Pattern 5**: Implicit `any` types in function parameters

### Testing Gaps (Priority: High)
- **Unit Tests**: Missing for admin components and hooks
- **Integration Tests**: No admin workflow testing
- **Type Testing**: No runtime type validation
- **Error Boundary Testing**: Missing error handling tests

## 🛠️ Testing Framework Components

### 1. Jest + React Native Testing Library
```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.4.2",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "react-test-renderer": "18.2.0"
  }
}
```

### 2. Type Testing with TypeScript
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

### 3. E2E Testing with Detox (Optional)
```json
{
  "devDependencies": {
    "detox": "^20.14.8"
  }
}
```

## 🔧 Setup Steps

### Step 1: Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest jest-environment-jsdom react-test-renderer @types/jest
```

### Step 2: Configure Jest
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Step 3: TypeScript Error Fixes

#### Fix Pattern 1: undefined → non-null assignments
```typescript
// Before (Error)
setSelectedProvider(providers.find(p => p.id === id)); // undefined → Provider

// After (Fixed)
const provider = providers.find(p => p.id === id);
setSelectedProvider(provider || null);
```

#### Fix Pattern 2: Missing interface properties
```typescript
// Before (Error)
const alert: EmergencyAlert = {
  id: '1',
  title: 'Test',
  // Missing required properties
};

// After (Fixed)  
const alert: EmergencyAlert = {
  id: '1',
  title: 'Test',
  type: 'emergency',
  society_id: 'society-1',
  declaredBy: 'admin-1',
  escalationLevel: 1,
  resolvedBy: null,
  resolvedAt: null,
};
```

#### Fix Pattern 3: Optional chaining for object access
```typescript
// Before (Error)
const name = user.profile.name; // user.profile might be undefined

// After (Fixed)
const name = user?.profile?.name || 'Unknown';
```

## 🧪 Test Categories

### 1. Unit Tests - Components
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button onPress={mockPress}>Press Me</Button>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <Button loading={true}>Loading Button</Button>
    );
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
```

### 2. Unit Tests - Hooks
```typescript
// __tests__/hooks/useDirectAuth.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';

describe('useDirectAuth Hook', () => {
  it('should return initial auth state', () => {
    const { result } = renderHook(() => useDirectAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('should handle login correctly', async () => {
    const { result } = renderHook(() => useDirectAuth());
    
    await act(async () => {
      await result.current.login({
        id: 'test-user',
        email: 'test@example.com',
        role: 'resident'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('test-user');
  });
});
```

### 3. Integration Tests - Admin Workflows
```typescript
// __tests__/integration/AdminWorkflow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AdminDashboard from '@/app/admin/dashboard';

const MockedAdminDashboard = () => (
  <NavigationContainer>
    <AdminDashboard />
  </NavigationContainer>
);

describe('Admin Dashboard Integration', () => {
  it('should load dashboard and display metrics', async () => {
    const { getByText, getByTestId } = render(<MockedAdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Admin Dashboard')).toBeTruthy();
      expect(getByTestId('metrics-container')).toBeTruthy();
    });
  });

  it('should navigate to society management', async () => {
    const { getByText } = render(<MockedAdminDashboard />);
    
    const societyButton = getByText('Society Management');
    fireEvent.press(societyButton);
    
    await waitFor(() => {
      expect(getByText('Society List')).toBeTruthy();
    });
  });
});
```

### 4. Store Tests - Zustand
```typescript
// __tests__/stores/adminStore.test.ts
import { useAdminStore } from '@/stores/slices/adminStore';

describe('Admin Store', () => {
  beforeEach(() => {
    useAdminStore.getState().reset();
  });

  it('should initialize with correct default state', () => {
    const state = useAdminStore.getState();
    
    expect(state.adminUser).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle admin profile loading', async () => {
    const { loadAdminProfile } = useAdminStore.getState();
    
    await loadAdminProfile('admin-123');
    
    const state = useAdminStore.getState();
    expect(state.adminUser?.id).toBe('admin-123');
    expect(state.loading).toBe(false);
  });
});
```

### 5. Type Safety Tests
```typescript
// __tests__/types/AdminTypes.test.ts
import { AdminUser, AdminPermission } from '@/types/admin';

describe('Admin Type Safety', () => {
  it('should validate AdminUser interface', () => {
    const adminUser: AdminUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'super_admin',
      permissions: [],
      assignedSocieties: [],
      department: 'IT',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(adminUser.role).toBe('super_admin');
    expect(Array.isArray(adminUser.permissions)).toBe(true);
  });

  it('should validate AdminPermission interface', () => {
    const permission: AdminPermission = {
      resource: 'societies',
      actions: ['read', 'write', 'manage'],
      scope: 'global',
    };

    expect(permission.actions).toContain('manage');
    expect(['global', 'assigned_societies', 'own']).toContain(permission.scope);
  });
});
```

## 🎯 Testing Commands

### Basic Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run typecheck
```

### Advanced Testing
```bash
# Run only admin tests
npm test -- --testPathPattern=admin

# Run only unit tests
npm test -- --testPathPattern=__tests__/components

# Run only integration tests
npm test -- --testPathPattern=__tests__/integration

# Run tests with specific coverage threshold
npm test -- --coverage --coverageThreshold='{"global":{"branches":80}}'
```

## 📊 Coverage Goals

### Target Coverage Metrics
- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

### High Priority Coverage Areas
1. **Admin Components**: 90%+ coverage
2. **Authentication Hooks**: 95%+ coverage
3. **Store Logic**: 85%+ coverage
4. **Critical User Flows**: 90%+ coverage

## 🔍 Quality Gates

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run typecheck && npm run lint && npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage
      - run: npx tsc --noEmit
```

## 🚀 Implementation Plan

### Phase 1: Setup (Week 1)
- [ ] Install testing dependencies
- [ ] Configure Jest and testing environment
- [ ] Set up TypeScript strict mode
- [ ] Create basic test utilities

### Phase 2: Unit Tests (Week 2)
- [ ] Test all UI components (Button, Card, etc.)
- [ ] Test custom hooks (useDirectAuth, useDirectAdmin)
- [ ] Test utility functions
- [ ] Test store slices

### Phase 3: Integration Tests (Week 3)
- [ ] Test admin workflows
- [ ] Test authentication flows
- [ ] Test navigation patterns
- [ ] Test form submissions

### Phase 4: Type Safety (Week 4)
- [ ] Fix all TypeScript errors
- [ ] Add strict type checking
- [ ] Implement runtime type validation
- [ ] Add type safety tests

### Phase 5: Advanced Testing (Week 5)
- [ ] Set up E2E testing with Detox
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Error boundary testing

## 📝 Testing Best Practices

### Component Testing
- **Test behavior, not implementation**
- **Use semantic queries** (`getByText`, `getByRole`)
- **Mock external dependencies**
- **Test error states and edge cases**

### Hook Testing
- **Test state changes and side effects**
- **Mock store dependencies**
- **Test async operations**
- **Verify cleanup and memory leaks**

### Integration Testing
- **Test complete user workflows**
- **Mock API calls and external services**
- **Test error handling and recovery**
- **Verify data persistence**

### Store Testing
- **Test state mutations**
- **Test action dispatching**
- **Test selectors and computed values**
- **Test persistence and hydration**

## 🔧 Troubleshooting

### Common Issues
1. **Module resolution errors**: Check tsconfig paths
2. **Jest transform errors**: Update transformIgnorePatterns
3. **React Native component testing**: Use proper testing utilities
4. **Async testing**: Use `waitFor` and `act` properly
5. **Store testing**: Reset state between tests

### Debug Commands
```bash
# Debug failing tests
npm test -- --verbose --no-cache

# Debug Jest configuration
npx jest --showConfig

# Debug TypeScript compilation
npx tsc --noEmit --listFiles
```

---

## 🎯 Success Metrics

**Quality Gates:**
- ✅ Zero TypeScript errors
- ✅ 85%+ test coverage
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ Accessibility standards met

**Ready for production deployment!** 🚀