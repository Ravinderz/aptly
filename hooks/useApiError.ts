/**
 * API Error Handling Hook
 * Comprehensive error handling with user-friendly messages and recovery actions
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { APIClientError } from '@/services/api.client';
import { API_ERRORS } from '@/config/api.config';

export interface ErrorInfo {
  message: string;
  code: string;
  statusCode: number;
  isNetworkError: boolean;
  isRetryable: boolean;
  details?: any;
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  customMessage?: string;
  onRetry?: () => void;
}

/**
 * API Error Handling Hook
 */
export const useApiError = () => {
  const [lastError, setLastError] = useState<ErrorInfo | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  /**
   * Check network connectivity
   */
  const checkNetworkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const netInfo = await NetInfo.fetch();
      const isConnected = netInfo.isConnected && netInfo.isInternetReachable !== false;
      setIsNetworkError(!isConnected);
      return isConnected;
    } catch (error) {
      console.warn('⚠️ Failed to check network status:', error);
      return true; // Assume connected if check fails
    }
  }, []);

  /**
   * Parse error and extract useful information
   */
  const parseError = useCallback((error: any): ErrorInfo => {
    // Handle APIClientError
    if (error instanceof APIClientError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        isNetworkError: error.statusCode === 0,
        isRetryable: error.statusCode >= 500 || error.statusCode === 0 || error.statusCode === 408,
        details: error.details,
      };
    }

    // Handle Axios errors
    if (error?.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.message || 
                     error.response.data?.error?.message || 
                     getDefaultErrorMessage(statusCode);
      
      return {
        message,
        code: error.response.data?.error?.code || `HTTP_${statusCode}`,
        statusCode,
        isNetworkError: false,
        isRetryable: statusCode >= 500 || statusCode === 408 || statusCode === 429,
        details: error.response.data,
      };
    }

    // Handle network errors
    if (!error?.response && (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network'))) {
      return {
        message: API_ERRORS.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        statusCode: 0,
        isNetworkError: true,
        isRetryable: true,
        details: error,
      };
    }

    // Handle timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return {
        message: API_ERRORS.TIMEOUT_ERROR,
        code: 'TIMEOUT_ERROR',
        statusCode: 408,
        isNetworkError: false,
        isRetryable: true,
        details: error,
      };
    }

    // Generic error
    return {
      message: error?.message || API_ERRORS.UNKNOWN_ERROR,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      isNetworkError: false,
      isRetryable: true,
      details: error,
    };
  }, []);

  /**
   * Get default error message based on status code
   */
  const getDefaultErrorMessage = useCallback((statusCode: number): string => {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return API_ERRORS.UNAUTHORIZED;
      case 403:
        return API_ERRORS.FORBIDDEN;
      case 404:
        return API_ERRORS.NOT_FOUND;
      case 408:
        return API_ERRORS.TIMEOUT_ERROR;
      case 422:
        return API_ERRORS.VALIDATION_ERROR;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return API_ERRORS.SERVER_ERROR;
      case 502:
        return 'Service temporarily unavailable. Please try again.';
      case 503:
        return 'Service under maintenance. Please try again later.';
      default:
        return statusCode >= 500 ? API_ERRORS.SERVER_ERROR : API_ERRORS.UNKNOWN_ERROR;
    }
  }, []);

  /**
   * Get user-friendly error message with context
   */
  const getUserFriendlyMessage = useCallback((errorInfo: ErrorInfo, context?: string): string => {
    let message = errorInfo.message;

    // Add context to the message
    if (context) {
      switch (context) {
        case 'login':
          message = errorInfo.isNetworkError 
            ? 'Unable to sign in. Please check your connection.'
            : errorInfo.statusCode === 401
              ? 'Invalid phone number or OTP. Please try again.'
              : `Sign in failed: ${message}`;
          break;
        case 'visitor_create':
          message = errorInfo.isNetworkError
            ? 'Unable to create visitor entry. Please check your connection.'
            : errorInfo.statusCode === 422
              ? 'Please fill in all required fields correctly.'
              : `Failed to create visitor entry: ${message}`;
          break;
        case 'data_load':
          message = errorInfo.isNetworkError
            ? 'Unable to load data. Please check your connection.'
            : `Failed to load data: ${message}`;
          break;
        default:
          // Keep original message
          break;
      }
    }

    return message;
  }, []);

  /**
   * Handle error with comprehensive error processing
   */
  const handleError = useCallback(async (
    error: any, 
    options: ErrorHandlerOptions = {}
  ): Promise<ErrorInfo> => {
    const {
      showAlert = false,
      logError = true,
      customMessage,
      onRetry,
    } = options;

    // Check network status
    await checkNetworkStatus();

    // Parse the error
    const errorInfo = parseError(error);
    setLastError(errorInfo);

    // Log error if enabled
    if (logError) {
      console.error('🚨 API Error:', {
        message: errorInfo.message,
        code: errorInfo.code,
        statusCode: errorInfo.statusCode,
        isNetworkError: errorInfo.isNetworkError,
        details: errorInfo.details,
      });
    }

    // Show alert if requested
    if (showAlert) {
      const message = customMessage || errorInfo.message;
      
      if (errorInfo.isRetryable && onRetry) {
        Alert.alert(
          'Error',
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: onRetry },
          ]
        );
      } else {
        Alert.alert('Error', message);
      }
    }

    return errorInfo;
  }, [checkNetworkStatus, parseError]);

  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback(async (error: any): Promise<ErrorInfo> => {
    const errorInfo = await handleError(error, {
      showAlert: false,
      customMessage: 'Session expired. Please sign in again.',
    });

    // Additional auth error handling can be added here
    // e.g., redirect to login, clear tokens, etc.

    return errorInfo;
  }, [handleError]);

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback((error: any): ErrorInfo => {
    const errorInfo = parseError(error);
    
    // Extract validation errors if available
    if (errorInfo.details?.validationErrors) {
      const validationMessages = errorInfo.details.validationErrors
        .map((err: any) => `${err.field}: ${err.message}`)
        .join('\n');
      
      errorInfo.message = `Validation failed:\n${validationMessages}`;
    }

    setLastError(errorInfo);
    return errorInfo;
  }, [parseError]);

  /**
   * Clear last error
   */
  const clearError = useCallback(() => {
    setLastError(null);
    setIsNetworkError(false);
  }, []);

  /**
   * Retry mechanism with exponential backoff
   */
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = parseError(error);

        // Don't retry if error is not retryable
        if (!errorInfo.isRetryable) {
          throw error;
        }

        // Don't delay on last attempt
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }, [parseError]);

  return {
    // State
    lastError,
    isNetworkError,
    
    // Methods
    handleError,
    handleAuthError,
    handleValidationError,
    getUserFriendlyMessage,
    clearError,
    retryWithBackoff,
    checkNetworkStatus,
    parseError,
  };
};

export default useApiError;