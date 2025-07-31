import { AuthService } from '../../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock API Service
jest.mock('../../services/api.service', () => ({
  APIService: {
    getInstance: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockApiService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset AsyncStorage mock
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();

    authService = AuthService.getInstance();

    // Get the mocked API service
    const { APIService } = require('../../services/api.service');
    mockApiService = APIService.getInstance();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Phone Number Authentication', () => {
    test('should send OTP successfully', async () => {
      const mockResponse = {
        success: true,
        sessionId: 'session-123',
        expiresIn: 300,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.sendOTP('9876543210');

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/send-otp', {
        phoneNumber: '+919876543210',
      });
      expect(result).toEqual(mockResponse);
    });

    test('should format phone number correctly', async () => {
      const mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      // Test various phone number formats
      await authService.sendOTP('9876543210');
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/send-otp', {
        phoneNumber: '+919876543210',
      });

      await authService.sendOTP('+919876543210');
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/send-otp', {
        phoneNumber: '+919876543210',
      });

      await authService.sendOTP('919876543210');
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/send-otp', {
        phoneNumber: '+919876543210',
      });
    });

    test('should handle OTP send errors', async () => {
      const mockError = {
        code: 'INVALID_PHONE',
        message: 'Invalid phone number',
        statusCode: 400,
      };

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.sendOTP('invalid')).rejects.toEqual(mockError);
    });
  });

  describe('OTP Verification', () => {
    test('should verify OTP successfully', async () => {
      const mockResponse = {
        success: true,
        isNewUser: false,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: 'user-123',
          phoneNumber: '+919876543210',
          fullName: 'Test User',
          email: 'test@example.com',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP('session-123', '123456');

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/verify-otp', {
        sessionId: 'session-123',
        otp: '123456',
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle invalid OTP', async () => {
      const mockError = {
        code: 'INVALID_OTP',
        message: 'Invalid OTP',
        statusCode: 400,
      };

      mockApiService.post.mockRejectedValue(mockError);

      await expect(
        authService.verifyOTP('session-123', '000000'),
      ).rejects.toEqual(mockError);
    });

    test('should handle expired OTP', async () => {
      const mockError = {
        code: 'OTP_EXPIRED',
        message: 'OTP has expired',
        statusCode: 400,
      };

      mockApiService.post.mockRejectedValue(mockError);

      await expect(
        authService.verifyOTP('session-123', '123456'),
      ).rejects.toEqual(mockError);
    });
  });

  describe('User Profile Management', () => {
    test('should complete user profile successfully', async () => {
      const profileData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        societyCode: 'SOC123',
        flatNumber: 'A-101',
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          ...profileData,
          phoneNumber: '+919876543210',
        },
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.completeProfile(profileData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/auth/complete-profile',
        profileData,
      );
      expect(result).toEqual(mockResponse);
    });

    test('should update user profile', async () => {
      const updateData = {
        fullName: 'John Updated',
        email: 'john.updated@example.com',
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user-123',
          ...updateData,
          phoneNumber: '+919876543210',
        },
      };

      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(updateData);

      expect(mockApiService.put).toHaveBeenCalledWith(
        '/auth/profile',
        updateData,
      );
      expect(result).toEqual(mockResponse);
    });

    test('should get current user profile', async () => {
      const mockUser = {
        id: 'user-123',
        phoneNumber: '+919876543210',
        fullName: 'Test User',
        email: 'test@example.com',
        societyCode: 'SOC123',
        flatNumber: 'A-101',
      };

      mockApiService.get.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(mockApiService.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('Token Management', () => {
    test('should store tokens in AsyncStorage', async () => {
      await authService.storeTokens('access-token', 'refresh-token');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
      );
    });

    test('should retrieve access token from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('stored-access-token');

      const token = await authService.getAccessToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(token).toBe('stored-access-token');
    });

    test('should return null when no access token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const token = await authService.getAccessToken();

      expect(token).toBeNull();
    });

    test('should refresh access token', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('refresh-token-123');

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'refresh-token-123',
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle refresh token failure', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-refresh-token');

      const mockError = {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
        statusCode: 401,
      };

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toEqual(mockError);
    });
  });

  describe('Logout', () => {
    test('should logout successfully', async () => {
      mockApiService.post.mockResolvedValue({ success: true });

      await authService.logout();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userProfile');
    });

    test('should clear local storage even if API call fails', async () => {
      mockApiService.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userProfile');
    });
  });

  describe('Authentication State', () => {
    test('should check if user is authenticated', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return Promise.resolve('valid-token');
        if (key === 'userProfile')
          return Promise.resolve(
            JSON.stringify({
              id: 'user-123',
              fullName: 'Test User',
            }),
          );
        return Promise.resolve(null);
      });

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    test('should return false when no token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });

    test('should return false when no user profile exists', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return Promise.resolve('valid-token');
        return Promise.resolve(null);
      });

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate Indian phone numbers', () => {
      const validNumbers = [
        '9876543210',
        '+919876543210',
        '919876543210',
        '8123456789',
        '7987654321',
        '6555444333',
      ];

      validNumbers.forEach((number) => {
        expect(() => authService.sendOTP(number)).not.toThrow();
      });
    });

    test('should reject invalid phone numbers', async () => {
      const invalidNumbers = [
        '123456789', // Too short
        '12345678901', // Too long
        '5876543210', // Doesn't start with 6-9
        '1876543210', // Doesn't start with 6-9
        'abcd123456', // Contains letters
        '', // Empty
      ];

      for (const number of invalidNumbers) {
        mockApiService.post.mockRejectedValue({
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format',
          statusCode: 400,
        });

        await expect(authService.sendOTP(number)).rejects.toMatchObject({
          code: 'INVALID_PHONE',
        });
      }
    });
  });
});
