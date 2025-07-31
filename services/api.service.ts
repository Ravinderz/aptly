import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from './auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileId?: string;
  error?: string;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export class APIService {
  private static instance: APIService;
  private axiosInstance: AxiosInstance;
  private authService: AuthService;
  private requestQueue: Array<() => Promise<any>> = [];
  private isOnline = true;

  private constructor() {
    this.authService = AuthService.getInstance();

    this.axiosInstance = axios.create({
      baseURL: 'https://api.aptly.app/v4', // Replace with actual API URL
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 (Unauthorized) - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newTokens = await this.authService.refreshToken();
            if (newTokens) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.axiosInstance(originalRequest);
            } else {
              // Refresh failed, logout user
              await this.authService.logout();
              // Navigate to login screen - implement navigation logic
            }
          } catch (refreshError) {
            await this.authService.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: any): APIError {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const message = error.response.data?.message || error.message;

      return {
        code: error.response.data?.code || `HTTP_${statusCode}`,
        message,
        statusCode,
        retryable:
          statusCode >= 500 || statusCode === 408 || statusCode === 429,
      };
    } else if (error.request) {
      // Network error
      return {
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
        retryable: true,
      };
    } else {
      // Other error
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
        retryable: false,
      };
    }
  }

  // Generic request method with retry logic
  async makeRequest<T>(config: AxiosRequestConfig, retryCount = 0): Promise<T> {
    const maxRetries = 3;

    try {
      const response: AxiosResponse<T> = await this.axiosInstance(config);
      return response.data;
    } catch (error: any) {
      const apiError = error as APIError;

      // Retry logic for retryable errors
      if (apiError.retryable && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeRequest<T>(config, retryCount + 1);
      }

      throw apiError;
    }
  }

  // File upload method
  async uploadFile(
    file: File | any,
    endpoint: string,
    progressCallback?: (progress: number) => void,
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: endpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            progressCallback(progress);
          }
        },
      };

      const response = await this.makeRequest<any>(config);

      return {
        success: true,
        fileUrl: response.fileUrl,
        fileId: response.fileId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'File upload failed',
      };
    }
  }

  // Network state management
  setNetworkState(state: NetworkState): void {
    this.isOnline = state.isConnected && state.isInternetReachable;

    if (this.isOnline && this.requestQueue.length > 0) {
      this.processRequestQueue();
    }
  }

  // Queue requests when offline
  private async queueRequest<T>(requestFunction: () => Promise<T>): Promise<T> {
    if (this.isOnline) {
      return requestFunction();
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFunction();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Process queued requests when back online
  private async processRequestQueue(): Promise<void> {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Queued request failed:', error);
        }
      }
    }
  }

  // Auth API calls
  async registerPhone(phoneNumber: string, societyCode: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/register-phone',
      data: { phoneNumber, societyCode },
    });
  }

  async verifyOTP(phoneNumber: string, otp: string, sessionId?: string) {
    return this.makeRequest({
      method: 'POST',
      url: '/auth/verify-otp',
      data: { phoneNumber, otp, sessionId },
    });
  }

  async getCurrentUser() {
    return this.makeRequest({
      method: 'GET',
      url: '/auth/me',
    });
  }

  // Maintenance API calls
  async createMaintenanceRequest(requestData: any) {
    return this.makeRequest({
      method: 'POST',
      url: '/services/maintenance',
      data: requestData,
    });
  }

  async getMaintenanceRequests(filters?: any) {
    return this.makeRequest({
      method: 'GET',
      url: '/services/maintenance',
      params: filters,
    });
  }

  async getMaintenanceRequest(id: string) {
    return this.makeRequest({
      method: 'GET',
      url: `/services/maintenance/${id}`,
    });
  }

  async getMaintenanceAnalytics() {
    return this.makeRequest({
      method: 'GET',
      url: '/services/maintenance/analytics',
    });
  }

  // Billing API calls
  async getBills(filters?: any) {
    return this.makeRequest({
      method: 'GET',
      url: '/services/billing/bills',
      params: filters,
    });
  }

  async getBill(id: string) {
    return this.makeRequest({
      method: 'GET',
      url: `/services/billing/bills/${id}`,
    });
  }

  async getBillPDF(id: string) {
    return this.makeRequest({
      method: 'GET',
      url: `/services/billing/bills/${id}/pdf`,
      responseType: 'blob',
    });
  }

  async calculateGST(amount: number) {
    return this.makeRequest({
      method: 'POST',
      url: '/services/billing/calculate-gst',
      data: { amount },
    });
  }

  // Society API calls
  async searchSocieties(query: string) {
    return this.makeRequest({
      method: 'GET',
      url: '/societies/search',
      params: { q: query },
    });
  }

  async getSocietyResidents(societyId: string) {
    return this.makeRequest({
      method: 'GET',
      url: `/societies/${societyId}/residents`,
    });
  }

  async verifySocietyCode(code: string) {
    return this.makeRequest({
      method: 'GET',
      url: `/societies/verify/${code}`,
    });
  }

  // Get instance for external use
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default APIService.getInstance();
