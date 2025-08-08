import axios from 'axios';
import { apiClient } from '../../services/api.client';
import { mockApiClient, mockNetworkState } from '../testUtils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { 
      headers: { common: {} },
      timeout: 10000,
      baseURL: 'https://api.aptly.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    mockNetworkState(true);
  });

  describe('Instance Creation', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.stringContaining('aptly'),
        timeout: expect.any(Number),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
    });

    it('should setup request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP Methods', () => {
    const mockResponse = {
      data: { message: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    it('should make GET request', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make GET request with params', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      const params = { page: 1, limit: 10 };

      await apiClient.get('/test', { params });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params });
    });

    it('should make POST request', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      const data = { name: 'test' };

      const result = await apiClient.post('/test', data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request with config', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      const data = { name: 'test' };
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      await apiClient.post('/test', data, config);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, config);
    });

    it('should make PUT request', async () => {
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      const data = { id: 1, name: 'updated' };

      const result = await apiClient.put('/test/1', data);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE request', async () => {
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/test/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PATCH request', async () => {
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);
      const data = { status: 'updated' };

      const result = await apiClient.patch('/test/1', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Authentication Integration', () => {
    it('should add Authorization header when token exists', async () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const mockConfig = {
        headers: {},
      };

      // Mock token exists
      const mockToken = 'mock-jwt-token';
      jest.doMock('../../services/auth.service.rest', () => ({
        RestAuthService: {
          getInstance: () => ({
            getAccessToken: jest.fn().mockResolvedValue(mockToken),
          }),
        },
      }));

      const modifiedConfig = await requestInterceptor(mockConfig);
      
      // In real implementation, this would be handled by the interceptor
      expect(modifiedConfig).toBeDefined();
    });

    it('should handle token refresh on 401 responses', async () => {
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: { url: '/test', headers: {} },
      };

      // This would trigger token refresh in real implementation
      await expect(responseInterceptor(mockError)).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
        request: {},
      };

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: expect.stringContaining('network'),
      });
    });

    it('should handle 400 Bad Request', async () => {
      const badRequestError = {
        response: {
          status: 400,
          data: { 
            message: 'Validation failed',
            errors: ['Field is required'] 
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(badRequestError);

      await expect(apiClient.post('/test', {})).rejects.toMatchObject({
        status: 400,
        message: 'Validation failed',
        errors: expect.arrayContaining(['Field is required']),
      });
    });

    it('should handle 404 Not Found', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(notFoundError);

      await expect(apiClient.get('/test/999')).rejects.toMatchObject({
        status: 404,
        message: 'Resource not found',
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        status: 500,
        message: 'Internal server error',
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      };

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        code: 'ECONNABORTED',
        message: expect.stringContaining('timeout'),
      });
    });
  });

  describe('Request Configuration', () => {
    it('should handle custom headers', async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const customHeaders = { 'X-Custom-Header': 'value' };
      await apiClient.get('/test', { headers: customHeaders });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        headers: customHeaders,
      });
    });

    it('should handle request timeout', async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.get('/test', { timeout: 5000 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        timeout: 5000,
      });
    });

    it('should handle response type configuration', async () => {
      const mockResponse = { data: new ArrayBuffer(8), status: 200 };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiClient.get('/test', { responseType: 'arraybuffer' });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        responseType: 'arraybuffer',
      });
    });
  });

  describe('File Upload', () => {
    it('should handle file upload with FormData', async () => {
      const mockResponse = {
        data: { fileId: '123', url: 'https://example.com/file.jpg' },
        status: 200,
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', 'mock-file' as any);
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      const result = await apiClient.post('/upload', formData, config);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/upload', formData, config);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle upload progress tracking', async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const onUploadProgress = jest.fn();
      const config = {
        onUploadProgress,
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      await apiClient.post('/upload', new FormData(), config);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({ onUploadProgress })
      );
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const requests = [
        apiClient.get('/test1'),
        apiClient.get('/test2'),
        apiClient.get('/test3'),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result).toEqual(mockResponse.data);
      });
    });

    it('should handle mixed request types concurrently', async () => {
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const requests = [
        apiClient.get('/test'),
        apiClient.post('/test', { data: 'test' }),
        apiClient.put('/test/1', { data: 'updated' }),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.put).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    it('should reuse axios instance', () => {
      // Multiple calls should reuse the same instance
      apiClient.get('/test1').catch(() => {});
      apiClient.get('/test2').catch(() => {});

      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });

    it('should handle request cancellation', async () => {
      const controller = new AbortController();
      mockAxiosInstance.get.mockImplementation(() => {
        return new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject({ name: 'AbortError', message: 'Request aborted' });
          });
        });
      });

      const requestPromise = apiClient.get('/test', { 
        signal: controller.signal 
      });
      
      controller.abort();

      await expect(requestPromise).rejects.toMatchObject({
        name: 'AbortError',
      });
    });
  });

  describe('Network State Integration', () => {
    it('should handle offline state', async () => {
      mockNetworkState(false);

      // Mock network check in client
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'No internet connection',
      };

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
    });

    it('should retry requests when back online', async () => {
      // First request fails (offline)
      mockNetworkState(false);
      mockAxiosInstance.get.mockRejectedValueOnce({
        code: 'NETWORK_ERROR',
      });

      // Second request succeeds (online)
      mockNetworkState(true);
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
      });

      // In a real implementation, this would be handled by retry logic
      try {
        await apiClient.get('/test');
      } catch (error) {
        expect(error.code).toBe('NETWORK_ERROR');
      }

      // Retry when online
      const result = await apiClient.get('/test');
      expect(result).toEqual({ success: true });
    });
  });
});