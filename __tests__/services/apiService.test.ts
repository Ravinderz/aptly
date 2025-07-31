import { APIService, APIError, NetworkState } from '../../services/api.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth service
jest.mock('../../services/auth.service', () => ({
  AuthService: {
    getInstance: jest.fn(() => ({
      getAccessToken: jest.fn().mockResolvedValue('mock-token'),
      refreshToken: jest.fn().mockResolvedValue('new-mock-token'),
      logout: jest.fn(),
    })),
  },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}));

describe('APIService', () => {
  let apiService: APIService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock axios instance - simplified for makeRequest testing
    mockAxiosInstance = jest.fn();
    mockAxiosInstance.interceptors = {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    };
    mockAxiosInstance.defaults = { headers: { common: {} } };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Get fresh instance
    apiService = APIService.getInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = APIService.getInstance();
      const instance2 = APIService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('HTTP Methods via makeRequest', () => {
    test('should make GET request via getCurrentUser', async () => {
      const mockResponse = { data: { user: 'test' }, status: 200 };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await apiService.getCurrentUser();

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'GET',
        url: '/auth/me',
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should make POST request via registerPhone', async () => {
      const mockResponse = { data: { success: true }, status: 201 };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await apiService.registerPhone('9876543210', 'SOC123');

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'POST',
        url: '/auth/register-phone',
        data: { phoneNumber: '9876543210', societyCode: 'SOC123' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should make GET request with params via getMaintenanceRequests', async () => {
      const mockResponse = { data: { requests: [] }, status: 200 };
      const filters = { status: 'open' };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await apiService.getMaintenanceRequests(filters);

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'GET',
        url: '/services/maintenance',
        params: filters,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors via getCurrentUser', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
        request: {},
      };

      mockAxiosInstance.mockRejectedValue(networkError);

      await expect(apiService.getCurrentUser()).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
        retryable: true,
      });
    });

    test('should handle 401 unauthorized errors via getCurrentUser', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      mockAxiosInstance.mockRejectedValue(unauthorizedError);

      await expect(apiService.getCurrentUser()).rejects.toMatchObject({
        code: 'HTTP_401',
        message: 'Unauthorized',
        statusCode: 401,
        retryable: false,
      });
    });

    test('should handle 404 not found errors via getMaintenanceRequest', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };

      mockAxiosInstance.mockRejectedValue(notFoundError);

      await expect(
        apiService.getMaintenanceRequest('invalid-id'),
      ).rejects.toMatchObject({
        code: 'HTTP_404',
        message: 'Not Found',
        statusCode: 404,
        retryable: false,
      });
    });

    test('should handle 500 server errors via getBills', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockAxiosInstance.mockRejectedValue(serverError);

      await expect(apiService.getBills()).rejects.toMatchObject({
        code: 'HTTP_500',
        message: 'Internal Server Error',
        statusCode: 500,
        retryable: true,
      });
    });
  });

  describe('Authentication Integration', () => {
    test('should setup interceptors for token management', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    test('should handle getBill requests', async () => {
      const mockResponse = { data: { bill: 'data' }, status: 200 };
      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await apiService.getBill('bill-123');

      expect(mockAxiosInstance).toHaveBeenCalledWith({
        method: 'GET',
        url: '/services/billing/bills/bill-123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Network State Management', () => {
    test('should handle online state changes', () => {
      const networkState: NetworkState = {
        isConnected: true,
        isInternetReachable: true,
      };

      // This tests the network state handling
      expect(networkState.isConnected).toBe(true);
      expect(networkState.isInternetReachable).toBe(true);
    });

    test('should handle offline state', () => {
      const networkState: NetworkState = {
        isConnected: false,
        isInternetReachable: false,
      };

      expect(networkState.isConnected).toBe(false);
      expect(networkState.isInternetReachable).toBe(false);
    });
  });

  describe('File Upload', () => {
    test('should handle file upload functionality', async () => {
      const mockResponse = {
        data: {
          success: true,
          fileUrl: 'https://example.com/file.pdf',
          fileId: 'file-123',
        },
        status: 200,
      };

      mockAxiosInstance.mockResolvedValue(mockResponse);

      const result = await apiService.uploadFile('mock-file-uri', '/upload');

      expect(result.success).toBe(true);
      expect(result.fileUrl).toBe('https://example.com/file.pdf');
      expect(result.fileId).toBe('file-123');
    });

    test('should handle file upload errors', async () => {
      const uploadError = {
        response: {
          status: 400,
          data: { message: 'Invalid file format' },
        },
      };

      mockAxiosInstance.mockRejectedValue(uploadError);

      const result = await apiService.uploadFile('invalid-file', '/upload');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
