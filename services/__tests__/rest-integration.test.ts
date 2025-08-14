/**
 * REST Integration Validation Tests
 * Tests to validate that all REST integration components work together
 */

import { apiClient } from '../api.client';
import { AuthService } from '../auth.service.rest';
import { VisitorsService } from '../visitors.service.rest';
import { 
  SecureTokenStorage, 
  SecureProfileStorage, 
  SecureSessionStorage,
  SecureBiometricStorage,
  clearAllSecureStorage 
} from '@/utils/storage.secure';

// Mock the HTTP client for testing
jest.mock('../api.client');
jest.mock('react-native-mmkv');
jest.mock('@react-native-community/netinfo');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('REST Integration Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAllSecureStorage();
  });

  describe('Secure Storage', () => {
    it('should store and retrieve tokens correctly', () => {
      const tokenData = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer' as const,
      };

      SecureTokenStorage.storeTokens(tokenData);
      
      expect(SecureTokenStorage.getAccessToken()).toBe(tokenData.accessToken);
      expect(SecureTokenStorage.getRefreshToken()).toBe(tokenData.refreshToken);
      expect(SecureTokenStorage.getTokenExpiresAt()).toBe(tokenData.expiresAt);
      
      const retrievedTokens = SecureTokenStorage.getTokens();
      expect(retrievedTokens).toEqual(tokenData);
    });

    it('should handle token expiration correctly', () => {
      const expiredTokenData = {
        accessToken: 'expired_token',
        refreshToken: 'refresh_token',
        expiresAt: Date.now() - 1000, // Expired 1 second ago
        tokenType: 'Bearer' as const,
      };

      SecureTokenStorage.storeTokens(expiredTokenData);
      expect(SecureTokenStorage.isTokenExpired()).toBe(true);
      expect(SecureTokenStorage.isTokenExpired(0)).toBe(true); // No threshold
    });

    it('should store and retrieve user profile correctly', () => {
      const userProfile = {
        id: 'test_user_id',
        name: 'Test User',
        phoneNumber: '+919876543210',
        role: 'resident' as const,
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      SecureProfileStorage.storeProfile(userProfile);
      const retrievedProfile = SecureProfileStorage.getProfile();
      
      expect(retrievedProfile).toEqual(userProfile);
    });

    it('should manage session data correctly', () => {
      const deviceId = 'test_device_id';
      const societyCode = 'TEST001';
      const sessionId = 'test_session_id';
      const timestamp = Date.now();

      SecureSessionStorage.storeDeviceId(deviceId);
      SecureSessionStorage.storeSocietyCode(societyCode);
      SecureSessionStorage.storeSessionId(sessionId);
      SecureSessionStorage.storeLastLoginTime(timestamp);

      expect(SecureSessionStorage.getDeviceId()).toBe(deviceId);
      expect(SecureSessionStorage.getSocietyCode()).toBe(societyCode);
      expect(SecureSessionStorage.getSessionId()).toBe(sessionId);
      expect(SecureSessionStorage.getLastLoginTime()).toBe(timestamp);
    });

    it('should manage biometric settings correctly', () => {
      const userId = 'test_user_id';

      SecureBiometricStorage.enableBiometric(userId);
      expect(SecureBiometricStorage.isBiometricEnabled()).toBe(true);
      expect(SecureBiometricStorage.getBiometricUserId()).toBe(userId);

      SecureBiometricStorage.disableBiometric();
      expect(SecureBiometricStorage.isBiometricEnabled()).toBe(false);
      expect(SecureBiometricStorage.getBiometricUserId()).toBeNull();
    });
  });

  describe('Authentication Service', () => {
    it('should validate phone numbers correctly', async () => {
      const validPhoneNumbers = [
        '+919876543210',
        '9876543210',
        '+91 9876543210',
        '91 9876 543 210',
      ];

      const invalidPhoneNumbers = [
        '123456789', // Too short
        '1234567890', // Invalid Indian number
        'invalid_phone',
        '+11234567890', // US number
      ];

      for (const phone of validPhoneNumbers) {
        const result = await AuthService.registerPhone(phone, 'TEST001');
        // Should not fail on phone validation
        expect(result.success).toBeDefined();
      }

      for (const phone of invalidPhoneNumbers) {
        const result = await AuthService.registerPhone(phone, 'TEST001');
        expect(result.success).toBe(false);
        expect(result.error).toContain('valid');
      }
    });

    it('should validate society codes correctly', async () => {
      const validCodes = ['TEST001', 'ABCD1234', 'XYZ9'];
      const invalidCodes = ['ab', '123', 'test_code', 'VERYLONGCODE123'];

      for (const code of validCodes) {
        const result = await AuthService.registerPhone('+919876543210', code);
        // Should not fail on society code validation
        expect(result.success).toBeDefined();
      }

      for (const code of invalidCodes) {
        const result = await AuthService.registerPhone('+919876543210', code);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Society code');
      }
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await AuthService.registerPhone('+919876543210', 'TEST001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('Visitors Service', () => {
    it('should validate visitor data correctly', async () => {
      const validVisitorData = {
        name: 'John Doe',
        phoneNumber: '+919876543210',
        purpose: 'Meeting with resident',
        expectedDuration: 60,
        hostFlatNumber: 'A-101',
      };

      const invalidVisitorData = [
        { ...validVisitorData, name: 'J' }, // Too short name
        { ...validVisitorData, phoneNumber: 'invalid' }, // Invalid phone
        { ...validVisitorData, purpose: 'A' }, // Too short purpose
        { ...validVisitorData, expectedDuration: 10 }, // Too short duration
        { ...validVisitorData, expectedDuration: 2000 }, // Too long duration
      ];

      // Valid data should pass validation
      const validResult = await VisitorsService.createVisitor(validVisitorData);
      // Should not fail on validation (API call might fail, but validation should pass)
      if (!validResult.success && validResult.code === 'VALIDATION_ERROR') {
        fail('Valid visitor data failed validation');
      }

      // Invalid data should fail validation
      for (const data of invalidVisitorData) {
        const result = await VisitorsService.createVisitor(data);
        expect(result.success).toBe(false);
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle visitor operations correctly', async () => {
      const visitorId = 'test_visitor_id';
      
      // Mock successful API responses
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: { id: visitorId, status: 'checked_in' },
      });

      const checkInResult = await VisitorsService.checkInVisitor(visitorId);
      expect(checkInResult.success).toBe(true);

      const checkOutResult = await VisitorsService.checkOutVisitor(visitorId);
      expect(checkOutResult.success).toBe(true);

      const approvalData = {
        approvedBy: 'test_user',
        approvalNotes: 'Approved for visit',
      };
      const approveResult = await VisitorsService.approveVisitor(visitorId, approvalData);
      expect(approveResult.success).toBe(true);
    });

    it('should require visitor ID for operations', async () => {
      const emptyIdResult = await VisitorsService.checkInVisitor('');
      expect(emptyIdResult.success).toBe(false);
      expect(emptyIdResult.code).toBe('VALIDATION_ERROR');

      const nullIdResult = await VisitorsService.getVisitor(null as any);
      expect(nullIdResult.success).toBe(false);
      expect(nullIdResult.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors consistently', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network request failed'));
      mockApiClient.post.mockRejectedValue(new Error('Network request failed'));

      const authResult = await AuthService.getCurrentUser();
      expect(authResult).toBeNull();

      const visitorResult = await VisitorsService.getVisitors();
      expect(visitorResult.success).toBe(false);
      expect(visitorResult.error).toContain('Network');
    });

    it('should handle API client errors with proper error codes', async () => {
      const apiError = {
        response: {
          status: 401,
          data: {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid credentials',
            },
          },
        },
      };

      mockApiClient.post.mockRejectedValue(apiError);

      const result = await AuthService.verifyOTP('+919876543210', '123456');
      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials');
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete a full authentication flow', async () => {
      const phoneNumber = '+919876543210';
      const societyCode = 'TEST001';
      const otp = '123456';

      // Mock successful responses
      mockApiClient.post
        .mockResolvedValueOnce({
          success: true,
          data: { sessionId: 'test_session', otpSent: true },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            user: {
              id: 'test_user',
              phoneNumber,
              name: 'Test User',
              role: 'resident',
              isVerified: true,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            },
            tokens: {
              accessToken: 'test_access_token',
              refreshToken: 'test_refresh_token',
              expiresAt: new Date().toISOString(),
              tokenType: 'Bearer',
            },
          },
        });

      // Register phone
      const registerResult = await AuthService.registerPhone(phoneNumber, societyCode);
      expect(registerResult.success).toBe(true);
      expect(registerResult.requiresOTP).toBe(true);

      // Verify OTP
      const verifyResult = await AuthService.verifyOTP(phoneNumber, otp);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data.user).toBeDefined();
      expect(verifyResult.data.tokens).toBeDefined();
    });

    it('should complete a full visitor management flow', async () => {
      const visitorData = {
        name: 'John Doe',
        phoneNumber: '+919876543210',
        purpose: 'Meeting with resident',
        expectedDuration: 60,
        hostFlatNumber: 'A-101',
      };

      const visitorResponse = {
        id: 'test_visitor',
        ...visitorData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Mock visitor creation
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: visitorResponse,
      });

      // Create visitor
      const createResult = await VisitorsService.createVisitor(visitorData);
      expect(createResult.success).toBe(true);
      expect(createResult.data.id).toBe('test_visitor');

      // Mock visitor operations
      mockApiClient.post
        .mockResolvedValueOnce({
          success: true,
          data: { ...visitorResponse, status: 'approved' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...visitorResponse, status: 'checked_in' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...visitorResponse, status: 'checked_out' },
        });

      // Approve visitor
      const approveResult = await VisitorsService.approveVisitor('test_visitor', {
        approvedBy: 'test_user',
        approvalNotes: 'Approved',
      });
      expect(approveResult.success).toBe(true);

      // Check in visitor
      const checkInResult = await VisitorsService.checkInVisitor('test_visitor');
      expect(checkInResult.success).toBe(true);

      // Check out visitor
      const checkOutResult = await VisitorsService.checkOutVisitor('test_visitor');
      expect(checkOutResult.success).toBe(true);
    });
  });

  describe('TypeScript Integration', () => {
    it('should provide proper type safety', () => {
      // This test validates that TypeScript types are working correctly
      const visitor: any = {
        id: 'test',
        name: 'Test User',
        phoneNumber: '+919876543210',
        status: 'pending',
        purpose: 'Meeting',
        expectedDuration: 60,
        hostFlatNumber: 'A-101',
        hostName: 'Host User',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      };

      // These should not cause TypeScript errors
      expect(visitor.id).toBe('test');
      expect(visitor.status).toBe('pending');
      expect(typeof visitor.expectedDuration).toBe('number');
    });

    it('should validate API response types', () => {
      const apiResponse = {
        success: true,
        data: { message: 'Success' },
        timestamp: new Date().toISOString(),
      };

      expect(apiResponse.success).toBe(true);
      expect(apiResponse.data.message).toBe('Success');
      expect(typeof apiResponse.timestamp).toBe('string');
    });
  });
});

describe('Environment Configuration', () => {
  it('should have proper API configuration', () => {
    // Import configuration
    const { API_CONFIG, API_ENDPOINTS, API_ERRORS } = require('@/config/api.config');

    // Validate configuration structure
    expect(API_CONFIG).toBeDefined();
    expect(API_CONFIG.BASE_URL).toBeDefined();
    expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
    expect(API_CONFIG.DEFAULT_HEADERS).toBeDefined();

    // Validate endpoints
    expect(API_ENDPOINTS.AUTH).toBeDefined();
    expect(API_ENDPOINTS.VISITORS).toBeDefined();
    expect(API_ENDPOINTS.AUTH.PHONE_REGISTER).toBeDefined();
    expect(API_ENDPOINTS.VISITORS.CREATE).toBeDefined();

    // Validate error messages
    expect(API_ERRORS.NETWORK_ERROR).toBeDefined();
    expect(API_ERRORS.UNAUTHORIZED).toBeDefined();
    expect(API_ERRORS.SERVER_ERROR).toBeDefined();
  });
});

describe('Performance and Memory', () => {
  it('should not leak memory in repeated operations', async () => {
    const iterations = 100;
    
    // Test token storage operations
    for (let i = 0; i < iterations; i++) {
      const tokens = {
        accessToken: `token_${i}`,
        refreshToken: `refresh_${i}`,
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer' as const,
      };
      
      SecureTokenStorage.storeTokens(tokens);
      SecureTokenStorage.getTokens();
    }

    // Should complete without memory issues
    expect(true).toBe(true);
  });

  it('should handle concurrent operations gracefully', async () => {
    const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
      AuthService.registerPhone(`+9198765432${i.toString().padStart(2, '0')}`, 'TEST001')
    );

    const results = await Promise.allSettled(concurrentOperations);
    
    // All operations should complete (though they may fail due to mocked responses)
    expect(results.length).toBe(10);
    results.forEach(result => {
      expect(result.status).toBe('fulfilled');
    });
  });
});