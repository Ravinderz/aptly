import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { 
  RoleGuard, 
  RequireSecurityGuard, 
  RequireSuperAdmin,
  RequireManager,
  RequireAdmin,
  RequireStaff
} from '../RoleGuard';
import { useDirectAuth } from '@/hooks/useDirectAuth';

// Mock the useDirectAuth hook
jest.mock('@/hooks/useDirectAuth');
const mockUseDirectAuth = useDirectAuth as jest.MockedFunction<typeof useDirectAuth>;

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('RoleGuard Components - DisplayName Fix Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component DisplayName Tests', () => {
    test('all role guard components have proper displayNames', () => {
      // Test that all components have displayName set
      expect(RoleGuard.displayName).toBe('RoleGuard');
      expect(RequireSecurityGuard.displayName).toBe('RequireSecurityGuard');
      expect(RequireSuperAdmin.displayName).toBe('RequireSuperAdmin');
      expect(RequireManager.displayName).toBe('RequireManager');
      expect(RequireAdmin.displayName).toBe('RequireAdmin');
      expect(RequireStaff.displayName).toBe('RequireStaff');
    });

    test('components are properly defined as forwardRef', () => {
      // Test that components are forwardRef components (not memo)
      expect(RequireSecurityGuard).toBeDefined();
      expect(RequireSuperAdmin).toBeDefined();
      expect(RequireManager).toBeDefined();
      expect(RequireAdmin).toBeDefined();
      expect(RequireStaff).toBeDefined();
      
      // forwardRef components should have the correct structure
      expect(typeof RequireSecurityGuard).toBe('object');
      expect(typeof RequireSuperAdmin).toBe('object');
      expect(typeof RequireManager).toBe('object');
      expect(typeof RequireAdmin).toBe('object');
      expect(typeof RequireStaff).toBe('object');
    });
  });

  describe('RequireSecurityGuard Component Tests', () => {
    test('renders children when user is security guard', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'security_guard', isVerified: true },
        isLoading: false,
      } as any);

      render(
        <RequireSecurityGuard>
          <div testID="security-content">Security Content</div>
        </RequireSecurityGuard>
      );

      expect(screen.getByTestId('security-content')).toBeTruthy();
    });

    test('shows verification required when security guard not verified', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'security_guard', isVerified: false },
        isLoading: false,
      } as any);

      render(
        <RequireSecurityGuard>
          <div testID="security-content">Security Content</div>
        </RequireSecurityGuard>
      );

      expect(screen.getByText('Account Verification Required')).toBeTruthy();
      expect(screen.queryByTestId('security-content')).toBeNull();
    });

    test('handles undefined children gracefully', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'security_guard', isVerified: true },
        isLoading: false,
      } as any);

      // This should not throw an error
      expect(() => {
        render(<RequireSecurityGuard>{undefined}</RequireSecurityGuard>);
      }).not.toThrow();
    });
  });

  describe('Other Role Guards Tests', () => {
    test('RequireSuperAdmin works with proper role', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'super_admin' },
        isLoading: false,
      } as any);

      render(
        <RequireSuperAdmin>
          <div testID="admin-content">Admin Content</div>
        </RequireSuperAdmin>
      );

      expect(screen.getByTestId('admin-content')).toBeTruthy();
    });

    test('RequireManager works with proper role', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'community_manager' },
        isLoading: false,
      } as any);

      render(
        <RequireManager>
          <div testID="manager-content">Manager Content</div>
        </RequireManager>
      );

      expect(screen.getByTestId('manager-content')).toBeTruthy();
    });

    test('RequireAdmin works with multiple roles', () => {
      mockUseDirectAuth.mockReturnValue({
        user: { role: 'society_admin' },
        isLoading: false,
      } as any);

      render(
        <RequireAdmin>
          <div testID="admin-content">Admin Content</div>
        </RequireAdmin>
      );

      expect(screen.getByTestId('admin-content')).toBeTruthy();
    });
  });

  describe('Error Handling Tests', () => {
    test('components handle null user gracefully', () => {
      mockUseDirectAuth.mockReturnValue({
        user: null,
        isLoading: false,
      } as any);

      expect(() => {
        render(
          <RequireSecurityGuard>
            <div testID="content">Content</div>
          </RequireSecurityGuard>
        );
      }).not.toThrow();
    });

    test('components handle loading state', () => {
      mockUseDirectAuth.mockReturnValue({
        user: null,
        isLoading: true,
      } as any);

      expect(() => {
        render(
          <RequireSecurityGuard>
            <div testID="content">Content</div>
          </RequireSecurityGuard>
        );
      }).not.toThrow();
    });
  });
});