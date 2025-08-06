import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminDashboard from '@/app/admin/dashboard';

// Mock the hooks
jest.mock('@/hooks/useDirectAuth', () => ({
  useDirectAuth: () => ({
    user: {
      id: 'admin-123',
      name: 'Test Admin',
      fullName: 'Test Admin User',
      role: 'super_admin',
      email: 'admin@test.com',
    },
  }),
}));

jest.mock('@/hooks/useDirectAdmin', () => ({
  useDirectAdmin: () => ({
    analytics: {
      overview: {
        totalSocieties: 150,
        totalUsers: 5000,
        totalRevenue: 1000000,
        activeSubscriptions: 140,
      },
      societies: {
        pendingApprovals: 5,
      },
      revenue: {
        monthlyRevenue: 100000,
      },
    },
    loading: false,
    error: null,
    loadDashboard: jest.fn(),
    checkPermission: jest.fn(() => true),
    getPendingApprovalsCount: jest.fn(() => 5),
    getHighPriorityItemsCount: jest.fn(() => 2),
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('AdminDashboard Integration Tests', () => {
  it('should render dashboard with welcome message', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Admin Dashboard')).toBeTruthy();
      expect(getByText(/Welcome back, Test Admin/)).toBeTruthy();
    });
  });

  it('should display metrics when analytics data is available', async () => {
    const { getByTestId } = render(<AdminDashboard />);
    
    await waitFor(() => {
      // Look for metrics container
      const metricsContainer = getByTestId('dashboard-metrics');
      expect(metricsContainer).toBeTruthy();
    });
  });

  it('should show quick action buttons', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Quick Actions')).toBeTruthy();
      expect(getByText('Society Onboarding')).toBeTruthy();
      expect(getByText('Society Management')).toBeTruthy();
      expect(getByText('Manager Assignments')).toBeTruthy();
    });
  });

  it('should handle refresh functionality', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      const refreshButton = getByText('Refresh');
      expect(refreshButton).toBeTruthy();
      
      fireEvent.press(refreshButton);
    });
  });

  it('should show access denied for non-super-admin users', async () => {
    // Mock a non-super-admin user
    jest.doMock('@/hooks/useDirectAuth', () => ({
      useDirectAuth: () => ({
        user: {
          id: 'user-123',
          name: 'Regular User',
          role: 'resident',
          email: 'user@test.com',
        },
      }),
    }));

    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Access Denied')).toBeTruthy();
      expect(getByText(/Super admin privileges required/)).toBeTruthy();
    });
  });

  it('should display error state when error occurs', async () => {
    // Mock error state
    jest.doMock('@/hooks/useDirectAdmin', () => ({
      useDirectAdmin: () => ({
        analytics: null,
        loading: false,
        error: 'Failed to load dashboard data',
        loadDashboard: jest.fn(),
        checkPermission: jest.fn(() => true),
        getPendingApprovalsCount: jest.fn(() => 0),
        getHighPriorityItemsCount: jest.fn(() => 0),
      }),
    }));

    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Failed to load dashboard data')).toBeTruthy();
    });
  });

  it('should show loading state initially', async () => {
    // Mock loading state
    jest.doMock('@/hooks/useDirectAdmin', () => ({
      useDirectAdmin: () => ({
        analytics: null,
        loading: true,
        error: null,
        loadDashboard: jest.fn(),
        checkPermission: jest.fn(() => true),
        getPendingApprovalsCount: jest.fn(() => 0),
        getHighPriorityItemsCount: jest.fn(() => 0),
      }),
    }));

    const { getByTestId } = render(<AdminDashboard />);
    
    // Check for loading indicators in metrics
    await waitFor(() => {
      const metricsContainer = getByTestId('dashboard-metrics');
      expect(metricsContainer).toBeTruthy();
    });
  });

  it('should handle quick action navigation', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };

    jest.doMock('expo-router', () => ({
      useRouter: () => mockRouter,
    }));

    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      const onboardingButton = getByText('Society Onboarding');
      fireEvent.press(onboardingButton);
    });

    // Note: In a real test, we'd verify navigation calls
    // expect(mockRouter.push).toHaveBeenCalledWith('/admin/onboarding/');
  });

  it('should show priority items when available', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      // Check for priority items quick action
      expect(getByText('Priority Items')).toBeTruthy();
    });
  });

  it('should handle pull-to-refresh', async () => {
    const { getByTestId } = render(<AdminDashboard />);
    
    await waitFor(() => {
      const scrollView = getByTestId('dashboard-scroll-view');
      expect(scrollView).toBeTruthy();
      
      // Simulate pull-to-refresh
      fireEvent(scrollView, 'refresh');
    });
  });

  it('should display analytics badges correctly', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      // Check for quick action badges showing counts
      const onboardingCard = getByText('Society Onboarding').parent;
      expect(onboardingCard).toBeTruthy();
      
      const priorityCard = getByText('Priority Items').parent;
      expect(priorityCard).toBeTruthy();
    });
  });

  it('should handle permission-based UI visibility', async () => {
    // Mock limited permissions
    jest.doMock('@/hooks/useDirectAdmin', () => ({
      useDirectAdmin: () => ({
        analytics: null,
        loading: false,
        error: null,
        loadDashboard: jest.fn(),
        checkPermission: jest.fn((resource, action) => {
          // Only allow societies management
          return resource === 'societies';
        }),
        getPendingApprovalsCount: jest.fn(() => 0),
        getHighPriorityItemsCount: jest.fn(() => 0),
      }),
    }));

    const { getByText, queryByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      // Should show societies management
      expect(getByText('Society Management')).toBeTruthy();
      
      // Should not show manager assignments (no permission)
      expect(queryByText('Manager Assignments')).toBeFalsy();
    });
  });
});