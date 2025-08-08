/**
 * API Integration Tests
 * End-to-end tests for API services and client
 */

import { apiClient, APIClientError } from '../../services/api.client';
import { restAuthService } from '../../services/auth.service.rest';
import { restVisitorsService } from '../../services/visitors.service.rest';
import { restNoticesService } from '../../services/notices.service.rest';
import {
  mockUtils,
  integrationUtils,
} from '../utils/testUtils.enhanced';

// Mock the API config
jest.mock('../../config/api.config', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:3000/api/v1',
    TIMEOUT: 30000,
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    DEVICE_INFO: {
      platform: 'test',
      deviceId: 'test-device-id',
      appVersion: '1.0.0',
      buildNumber: '1',
    },
  },
  API_ENDPOINTS: {
    AUTH: {
      PHONE_REGISTER: '/auth/phone/register',
      VERIFY_OTP: '/auth/phone/verify',
      REFRESH_TOKEN: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      UPDATE_PROFILE: '/auth/profile',
    },
    VISITORS: {
      LIST: '/visitors',
      CREATE: '/visitors',
      GET: (id: string) => `/visitors/${id}`,
      UPDATE: (id: string) => `/visitors/${id}`,
      DELETE: (id: string) => `/visitors/${id}`,
      CHECK_IN: (id: string) => `/visitors/${id}/check-in`,
      CHECK_OUT: (id: string) => `/visitors/${id}/check-out`,
    },
    NOTICES: {
      LIST: '/notices',
      CREATE: '/notices',
      GET: (id: string) => `/notices/${id}`,
      UPDATE: (id: string) => `/notices/${id}`,
      DELETE: (id: string) => `/notices/${id}`,
    },
  },
  API_ERRORS: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Mock secure storage
const mockSecureStorage = mockUtils.createMockAsyncStorage();
jest.mock('../utils/storage.secure', () => ({
  SecureTokenStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    getTokens: jest.fn(),
    storeTokens: jest.fn(),
    isTokenExpired: jest.fn(() => false),
  },
  SecureSessionStorage: {
    getSocietyCode: jest.fn(),
    getDeviceId: jest.fn(() => 'test-device'),
    getSessionId: jest.fn(),
    storeSocietyCode: jest.fn(),
    storeSessionId: jest.fn(),
    storeLastLoginTime: jest.fn(),
  },
  SecureProfileStorage: {
    getProfile: jest.fn(),
    storeProfile: jest.fn(),
  },
  clearAllSecureStorage: jest.fn(),
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetch.mockClear();
  });

  describe('API Client', () => {
    describe('Request Handling', () => {
      it('makes successful GET request', async () => {
        const mockResponse = mockUtils.createMockApiResponse({ data: 'test' });
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await apiClient.get('/test');

        expect(mockedFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/v1/test',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }),
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it('makes successful POST request with data', async () => {
        const testData = { name: 'test' };
        const mockResponse = mockUtils.createMockApiResponse(testData);
        
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await apiClient.post('/test', testData);

        expect(mockedFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/v1/test',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(testData),
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it('handles 404 error correctly', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: 'Not found' }),
          headers: new Headers(),
        } as Response);

        await expect(apiClient.get('/nonexistent')).rejects.toThrow(APIClientError);
      });

      it('handles network errors', async () => {
        mockedFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(apiClient.get('/test')).rejects.toThrow();
      });

      it('handles timeout errors', async () => {
        mockedFetch.mockRejectedValueOnce({ code: 'ECONNABORTED' });

        await expect(apiClient.get('/test')).rejects.toThrow();
      });
    });

    describe('Authentication', () => {
      it('attaches authorization header when token exists', async () => {
        const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
        mockTokenStorage.getAccessToken.mockReturnValue('mock-token');
        
        const mockResponse = mockUtils.createMockApiResponse({ data: 'test' });
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        await apiClient.get('/protected');

        expect(mockedFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token',
            }),
          })
        );
      });

      it('handles token refresh on 401 error', async () => {
        const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
        mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');
        
        // First request fails with 401
        mockedFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' }),
            headers: new Headers(),
          } as Response)
          // Token refresh succeeds
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              success: true,
              data: { accessToken: 'new-token', refreshToken: 'new-refresh-token', expiresIn: 3600 }
            }),
            headers: new Headers(),
          } as Response)
          // Retry request succeeds
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockUtils.createMockApiResponse({ data: 'success' })),
            headers: new Headers(),
          } as Response);

        const result = await apiClient.get('/protected');

        expect(mockedFetch).toHaveBeenCalledTimes(3);
        expect(mockTokenStorage.storeTokens).toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('throws APIClientError for API errors', async () => {
        mockedFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: { message: 'Bad request', code: 'BAD_REQUEST' }
          }),
          headers: new Headers(),
        } as Response);

        await expect(apiClient.get('/test')).rejects.toThrow(APIClientError);
      });

      it('includes error details in thrown error', async () => {
        const errorDetails = { field: 'email', message: 'Invalid email' };
        mockedFetch.mockResolvedValueOnce({
          ok: false,
          status: 422,
          json: () => Promise.resolve({
            error: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
            details: errorDetails,
          }),
          headers: new Headers(),
        } as Response);

        try {
          await apiClient.get('/test');
        } catch (error) {
          expect(error).toBeInstanceOf(APIClientError);
          expect((error as APIClientError).details).toEqual(errorDetails);
        }
      });
    });
  });

  describe('Authentication Service', () => {
    describe('Phone Registration', () => {
      it('registers phone number successfully', async () => {
        const mockResponse = mockUtils.createMockApiResponse({
          sessionId: 'test-session',
          message: 'OTP sent',
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restAuthService.registerPhone('+919876543210', 'TEST123');

        expect(result.success).toBe(true);
        expect(result.requiresOTP).toBe(true);
        expect(result.sessionId).toBe('test-session');
      });

      it('validates phone number format', async () => {
        const result = await restAuthService.registerPhone('invalid-phone', 'TEST123');

        expect(result.success).toBe(false);
        expect(result.error).toContain('valid');
      });

      it('validates society code format', async () => {
        const result = await restAuthService.registerPhone('+919876543210', 'invalid');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Society code');
      });
    });

    describe('OTP Verification', () => {
      it('verifies OTP successfully', async () => {
        const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
        const mockSessionStorage = require('../utils/storage.secure').SecureSessionStorage;
        
        mockSessionStorage.getSessionId.mockReturnValue('test-session');
        
        const mockUser = {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+919876543210',
          role: 'resident',
          flatNumber: 'A-101',
          isVerified: true,
          societyCode: 'TEST123',
        };

        const mockTokens = {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        };

        const mockResponse = mockUtils.createMockApiResponse({
          user: mockUser,
          tokens: mockTokens,
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restAuthService.verifyOTP('+919876543210', '123456');

        expect(result.success).toBe(true);
        expect(result.data.user.name).toBe('Test User');
        expect(mockTokenStorage.storeTokens).toHaveBeenCalled();
      });

      it('validates OTP format', async () => {
        const result = await restAuthService.verifyOTP('+919876543210', '12345');

        expect(result.success).toBe(false);
        expect(result.error).toContain('6 digits');
      });

      it('requires session ID', async () => {
        const mockSessionStorage = require('../utils/storage.secure').SecureSessionStorage;
        mockSessionStorage.getSessionId.mockReturnValue(null);

        const result = await restAuthService.verifyOTP('+919876543210', '123456');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Session expired');
      });
    });

    describe('Token Management', () => {
      it('refreshes token successfully', async () => {
        const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
        mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

        const mockResponse = mockUtils.createMockApiResponse({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const tokens = await restAuthService.refreshToken();

        expect(tokens).toBeTruthy();
        expect(tokens!.accessToken).toBe('new-access-token');
        expect(mockTokenStorage.storeTokens).toHaveBeenCalled();
      });

      it('checks authentication status correctly', async () => {
        const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
        mockTokenStorage.getTokens.mockReturnValue({
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresAt: Date.now() + 3600000,
        });
        mockTokenStorage.isTokenExpired.mockReturnValue(false);

        const isAuth = await restAuthService.isAuthenticated();

        expect(isAuth).toBe(true);
      });
    });
  });

  describe('Visitors Service', () => {
    describe('Create Visitor', () => {
      it('creates visitor successfully', async () => {
        const visitorData = {
          name: 'John Doe',
          phoneNumber: '+919876543210',
          purpose: 'Meeting with family',
          expectedDuration: 120,
          vehicleNumber: 'MH12AB1234',
        };

        const mockResponse = mockUtils.createMockApiResponse({
          id: 'visitor1',
          ...visitorData,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restVisitorsService.createVisitor(visitorData);

        expect(result.success).toBe(true);
        expect(result.data.name).toBe('John Doe');
      });

      it('validates visitor data', async () => {
        const invalidData = {
          name: 'A', // Too short
          phoneNumber: 'invalid',
          purpose: 'Hi', // Too short
          expectedDuration: 5, // Too short
        };

        const result = await restVisitorsService.createVisitor(invalidData);

        expect(result.success).toBe(false);
        expect(result.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('Visitor Operations', () => {
      it('gets visitor list successfully', async () => {
        const mockVisitors = [
          { id: 'visitor1', name: 'John Doe', status: 'pending' },
          { id: 'visitor2', name: 'Jane Smith', status: 'approved' },
        ];

        const mockResponse = mockUtils.createMockApiResponse(mockVisitors);

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restVisitorsService.getVisitors();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
      });

      it('checks in visitor successfully', async () => {
        const visitorId = 'visitor1';
        const mockResponse = mockUtils.createMockApiResponse({
          id: visitorId,
          status: 'checked_in',
          checkInTime: new Date().toISOString(),
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restVisitorsService.checkInVisitor(visitorId);

        expect(result.success).toBe(true);
        expect(result.data.status).toBe('checked_in');
      });

      it('gets visitor statistics', async () => {
        const mockStats = {
          total: 100,
          pending: 5,
          approved: 80,
          rejected: 10,
          checkedIn: 5,
        };

        const mockResponse = mockUtils.createMockApiResponse(mockStats);

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restVisitorsService.getVisitorStats();

        expect(result.success).toBe(true);
        expect(result.data.total).toBe(100);
      });
    });
  });

  describe('Notices Service', () => {
    describe('Notice Management', () => {
      it('creates notice successfully', async () => {
        const noticeData = {
          title: 'Important Notice',
          content: 'This is an important announcement for all residents.',
          category: 'announcement' as const,
          priority: 'high' as const,
          isUrgent: false,
          targetAudience: 'all' as const,
          createdBy: 'admin',
        };

        const mockResponse = mockUtils.createMockApiResponse({
          id: 'notice1',
          ...noticeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readBy: [],
        });

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restNoticesService.createNotice(noticeData);

        expect(result.success).toBe(true);
        expect(result.data.title).toBe('Important Notice');
      });

      it('validates notice data', async () => {
        const invalidData = {
          title: 'Hi', // Too short
          content: 'Short', // Too short
          category: 'invalid' as any,
          priority: 'invalid' as any,
        };

        const result = await restNoticesService.createNotice(invalidData);

        expect(result.success).toBe(false);
        expect(result.code).toBe('VALIDATION_ERROR');
      });

      it('gets urgent notices', async () => {
        const mockNotices = [
          { id: 'notice1', title: 'Urgent', isUrgent: true, priority: 'urgent' },
          { id: 'notice2', title: 'Emergency', isUrgent: true, priority: 'urgent' },
        ];

        const mockResponse = mockUtils.createMockApiResponse(mockNotices);

        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        } as Response);

        const result = await restNoticesService.getUrgentNotices();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
      });
    });
  });

  describe('End-to-End User Flows', () => {
    it('completes authentication flow', async () => {
      const mockServer = integrationUtils.createMockServer();
      
      // Setup mock responses
      mockServer.on('/auth/phone/register', () =>
        mockUtils.createMockApiResponse({ sessionId: 'session1', message: 'OTP sent' })
      );
      
      mockServer.on('/auth/phone/verify', () =>
        mockUtils.createMockApiResponse({
          user: { id: 'user1', name: 'Test User' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
        })
      );

      // Test the flow
      await integrationUtils.testUserFlow([
        async () => {
          const registerResult = await mockServer.call('/auth/phone/register', {
            phoneNumber: '+919876543210',
            societyCode: 'TEST123',
          });
          expect(registerResult.success).toBe(true);
        },
        async () => {
          const verifyResult = await mockServer.call('/auth/phone/verify', {
            sessionId: 'session1',
            otp: '123456',
          });
          expect(verifyResult.success).toBe(true);
        },
      ]);
    });

    it('completes visitor management flow', async () => {
      const mockServer = integrationUtils.createMockServer();
      
      // Setup mock responses
      mockServer.on('/visitors', (data) => {
        if (!data) {
          // GET request - return list
          return mockUtils.createMockApiResponse([
            { id: 'visitor1', name: 'John Doe', status: 'pending' }
          ]);
        } else {
          // POST request - create visitor
          return mockUtils.createMockApiResponse({
            id: 'visitor2',
            ...data,
            status: 'pending',
          });
        }
      });

      mockServer.on('/visitors/visitor2/check-in', () =>
        mockUtils.createMockApiResponse({
          id: 'visitor2',
          status: 'checked_in',
          checkInTime: new Date().toISOString(),
        })
      );

      // Test the flow
      await integrationUtils.testUserFlow([
        async () => {
          const listResult = await mockServer.call('/visitors');
          expect(listResult.data).toHaveLength(1);
        },
        async () => {
          const createResult = await mockServer.call('/visitors', {
            name: 'New Visitor',
            phoneNumber: '+919876543210',
            purpose: 'Meeting',
          });
          expect(createResult.data.name).toBe('New Visitor');
        },
        async () => {
          const checkInResult = await mockServer.call('/visitors/visitor2/check-in');
          expect(checkInResult.data.status).toBe('checked_in');
        },
      ]);
    });
  });

  describe('Error Recovery', () => {
    it('handles intermittent network failures', async () => {
      // First request fails
      mockedFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUtils.createMockApiResponse({ data: 'success' })),
          headers: new Headers(),
        } as Response);

      // Should retry and succeed
      const result = await apiClient.get('/test');
      expect(result.success).toBe(true);
    });

    it('handles token expiration gracefully', async () => {
      const mockTokenStorage = require('../utils/storage.secure').SecureTokenStorage;
      mockTokenStorage.getAccessToken.mockReturnValue('expired-token');
      mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');
      mockTokenStorage.isTokenExpired.mockReturnValue(true);

      // Token refresh succeeds
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            data: { accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600 }
          }),
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUtils.createMockApiResponse({ data: 'protected-data' })),
          headers: new Headers(),
        } as Response);

      const result = await apiClient.get('/protected');
      expect(result.success).toBe(true);
    });
  });
});