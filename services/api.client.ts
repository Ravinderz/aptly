/**
 * HTTP Client with Interceptors
 * Centralized HTTP client with authentication, error handling, and retry logic
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG, API_ENDPOINTS, API_ERRORS, RETRY_CONFIG } from '@/config/api.config';
import { 
  SecureTokenStorage, 
  SecureSessionStorage, 
  SecureProfileStorage,
  clearAllSecureStorage 
} from '@/utils/storage.secure';
import { APIResponse, APIError } from '@/types/api';

/**
 * Custom API Error class
 */
export class APIClientError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'APIClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * HTTP Client Class
 */
class APIClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create Axios instance with default configuration
   */
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        'X-Device-Platform': API_CONFIG.DEVICE_INFO.platform,
        'X-Device-ID': API_CONFIG.DEVICE_INFO.deviceId,
        'X-App-Version': API_CONFIG.DEVICE_INFO.appVersion,
      },
    });

    return instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        await this.attachAuthToken(config);
        this.attachSocietyCode(config);
        this.attachDeviceInfo(config);
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logResponse(response);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Attach authentication token to request
   */
  private async attachAuthToken(config: InternalAxiosRequestConfig): Promise<void> {
    const accessToken = SecureTokenStorage.getAccessToken();
    
    if (accessToken) {
      // Check if token is expired or about to expire
      if (SecureTokenStorage.isTokenExpired(API_CONFIG.TOKEN_REFRESH_THRESHOLD)) {
        try {
          const newToken = await this.refreshTokenIfNeeded();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          console.warn('⚠️ Token refresh failed, proceeding with existing token');
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  }

  /**
   * Attach society code to request headers
   */
  private attachSocietyCode(config: InternalAxiosRequestConfig): void {
    const societyCode = SecureSessionStorage.getSocietyCode();
    if (societyCode) {
      config.headers['X-Society-Code'] = societyCode;
    }
  }

  /**
   * Attach device info to request headers
   */
  private attachDeviceInfo(config: InternalAxiosRequestConfig): void {
    const deviceId = SecureSessionStorage.getDeviceId();
    const sessionId = SecureSessionStorage.getSessionId();
    
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
  }

  /**
   * Handle response errors with retry logic and token refresh
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    this.logError(error);

    // Handle network errors
    if (!error.response) {
      const isConnected = await this.checkNetworkConnection();
      if (!isConnected) {
        throw new APIClientError(
          API_ERRORS.NETWORK_ERROR,
          0,
          'NETWORK_ERROR'
        );
      }
    }

    const status = error.response?.status;

    // Handle 401 Unauthorized - Token expired
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await this.refreshTokenIfNeeded();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        await this.handleAuthenticationFailure();
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      throw new APIClientError(
        API_ERRORS.FORBIDDEN,
        403,
        'FORBIDDEN',
        error.response?.data
      );
    }

    // Handle 404 Not Found
    if (status === 404) {
      throw new APIClientError(
        API_ERRORS.NOT_FOUND,
        404,
        'NOT_FOUND',
        error.response?.data
      );
    }

    // Handle validation errors (422)
    if (status === 422) {
      throw new APIClientError(
        API_ERRORS.VALIDATION_ERROR,
        422,
        'VALIDATION_ERROR',
        error.response?.data
      );
    }

    // Handle server errors (5xx) with retry
    if (status && status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (RETRY_CONFIG.retryCondition(error)) {
        await this.delay(RETRY_CONFIG.retryDelay(0));
        return this.axiosInstance(originalRequest);
      }
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      throw new APIClientError(
        API_ERRORS.TIMEOUT_ERROR,
        408,
        'TIMEOUT_ERROR'
      );
    }

    // Generic error handling
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error?.message || 
                        error.message || 
                        API_ERRORS.UNKNOWN_ERROR;

    throw new APIClientError(
      errorMessage,
      status || 500,
      error.response?.data?.error?.code || 'API_ERROR',
      error.response?.data
    );
  }

  /**
   * Refresh token if needed
   */
  private async refreshTokenIfNeeded(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = SecureTokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        { refreshToken },
        {
          headers: API_CONFIG.DEFAULT_HEADERS,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      const { data } = response.data;
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      await SecureTokenStorage.storeTokens(tokens);
      console.log('✅ Token refreshed successfully');
      
      return tokens.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.handleAuthenticationFailure();
      return null;
    }
  }

  /**
   * Handle authentication failure
   */
  private async handleAuthenticationFailure(): Promise<void> {
    console.log('🔓 Authentication failed, clearing all data');
    await clearAllSecureStorage();
    
    // You might want to emit an event or call a callback here
    // to notify the app about authentication failure
  }

  /**
   * Check network connection
   */
  private async checkNetworkConnection(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected && netInfo.isInternetReachable !== false;
    } catch (error) {
      console.warn('⚠️ Failed to check network connection:', error);
      return true; // Assume connected if check fails
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log successful responses (only in development)
   */
  private logResponse(response: AxiosResponse): void {
    if (__DEV__) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
  }

  /**
   * Log errors (only in development)
   */
  private logError(error: AxiosError): void {
    if (__DEV__) {
      const status = error.response?.status;
      const method = error.config?.method?.toUpperCase();
      const url = error.config?.url;
      const message = error.response?.data?.message || error.message;
      
      console.error(`❌ ${method} ${url} - ${status || 'Network Error'}: ${message}`);
    }
  }

  // Public API methods

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    const response = await this.axiosInstance.get<APIResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response = await this.axiosInstance.post<APIResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response = await this.axiosInstance.put<APIResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const response = await this.axiosInstance.patch<APIResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    const response = await this.axiosInstance.delete<APIResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Upload file
   */
  public async upload<T = any>(
    url: string,
    file: FormData,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 1 minute for uploads
    };

    const response = await this.axiosInstance.post<APIResponse<T>>(url, file, uploadConfig);
    return response.data;
  }

  /**
   * Get raw axios instance for advanced usage
   */
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;