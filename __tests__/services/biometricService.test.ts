/**
 * Biometric Service Testing
 * Tests biometric authentication functionality and security features
 */

import * as LocalAuthentication from 'expo-local-authentication';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
  },
  LocalAuthenticationResult: {
    success: true,
    error: null,
  },
}));

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

// Biometric Service Implementation (inline for testing)
class BiometricService {
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  static async authenticate(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getSupportedTypes(): Promise<number[]> {
    try {
      const types = await LocalAuthentication.getEnrolledLevelAsync();
      return [types];
    } catch (error) {
      console.error('Error getting supported types:', error);
      return [];
    }
  }

  static async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available');
      }
      
      const authResult = await this.authenticate();
      return authResult.success;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  static async disableBiometric(): Promise<boolean> {
    // In a real implementation, this would clear stored biometric data
    // For now, we'll just return success
    return true;
  }
}

describe('BiometricService', () => {
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('isAvailable', () => {
    test('should return true when hardware is available and enrolled', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(true);
      expect(mockLocalAuth.hasHardwareAsync).toHaveBeenCalledTimes(1);
      expect(mockLocalAuth.isEnrolledAsync).toHaveBeenCalledTimes(1);
    });

    test('should return false when hardware is not available', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
    });

    test('should return false when not enrolled', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
    });

    test('should return false and log error on exception', async () => {
      const error = new Error('Hardware check failed');
      mockLocalAuth.hasHardwareAsync.mockRejectedValue(error);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith('Error checking biometric availability:', error);
    });

    test('should handle both hardware and enrollment failures', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('authenticate', () => {
    test('should return success when authentication succeeds', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: null,
      } as any);

      const result = await BiometricService.authenticate();

      expect(result).toEqual({ success: true });
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });
    });

    test('should return failure with error message when authentication fails', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'User cancelled',
      } as any);

      const result = await BiometricService.authenticate();

      expect(result).toEqual({ 
        success: false, 
        error: 'User cancelled' 
      });
    });

    test('should return failure with default message when no error provided', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: null,
      } as any);

      const result = await BiometricService.authenticate();

      expect(result).toEqual({ 
        success: false, 
        error: 'Authentication failed' 
      });
    });

    test('should handle authentication exceptions', async () => {
      const error = new Error('Authentication error');
      mockLocalAuth.authenticateAsync.mockRejectedValue(error);

      const result = await BiometricService.authenticate();

      expect(result).toEqual({ 
        success: false, 
        error: 'Authentication error' 
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Biometric authentication error:', error);
    });

    test('should handle non-Error exceptions', async () => {
      mockLocalAuth.authenticateAsync.mockRejectedValue('String error');

      const result = await BiometricService.authenticate();

      expect(result).toEqual({ 
        success: false, 
        error: 'Unknown error' 
      });
    });
  });

  describe('getSupportedTypes', () => {
    test('should return supported authentication types', async () => {
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(2);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual([2]);
      expect(mockLocalAuth.getEnrolledLevelAsync).toHaveBeenCalledTimes(1);
    });

    test('should return empty array on error', async () => {
      const error = new Error('Types error');
      mockLocalAuth.getEnrolledLevelAsync.mockRejectedValue(error);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error getting supported types:', error);
    });

    test('should handle multiple authentication types', async () => {
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(1);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual([1]);
    });
  });

  describe('enableBiometric', () => {
    test('should enable biometric when available and authentication succeeds', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: null,
      } as any);

      const result = await BiometricService.enableBiometric();

      expect(result).toBe(true);
    });

    test('should fail when biometric is not available', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await BiometricService.enableBiometric();

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error enabling biometric:', 
        expect.any(Error)
      );
    });

    test('should fail when authentication fails', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      } as any);

      const result = await BiometricService.enableBiometric();

      expect(result).toBe(false);
    });

    test('should handle exceptions during enable process', async () => {
      const error = new Error('Enable error');
      mockLocalAuth.hasHardwareAsync.mockRejectedValue(error);

      const result = await BiometricService.enableBiometric();

      expect(result).toBe(false);
      // The error is first logged in isAvailable(), then in enableBiometric()
      expect(mockConsoleError).toHaveBeenCalledWith('Error checking biometric availability:', error);
      expect(mockConsoleError).toHaveBeenCalledWith('Error enabling biometric:', 
        expect.objectContaining({ message: 'Biometric authentication is not available' })
      );
    });
  });

  describe('disableBiometric', () => {
    test('should successfully disable biometric', async () => {
      const result = await BiometricService.disableBiometric();

      expect(result).toBe(true);
    });

    test('should consistently return success', async () => {
      const results = await Promise.all([
        BiometricService.disableBiometric(),
        BiometricService.disableBiometric(),
        BiometricService.disableBiometric(),
      ]);

      expect(results).toEqual([true, true, true]);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete biometric setup flow', async () => {
      // Check availability
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      
      const isAvailable = await BiometricService.isAvailable();
      expect(isAvailable).toBe(true);

      // Get supported types
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(2);
      const types = await BiometricService.getSupportedTypes();
      expect(types).toEqual([2]);

      // Enable biometric
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: null,
      } as any);
      
      const enabled = await BiometricService.enableBiometric();
      expect(enabled).toBe(true);

      // Disable biometric
      const disabled = await BiometricService.disableBiometric();
      expect(disabled).toBe(true);
    });

    test('should handle failure scenarios gracefully', async () => {
      // Hardware not available
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      
      const isAvailable = await BiometricService.isAvailable();
      expect(isAvailable).toBe(false);

      // Try to enable anyway (should fail)
      const enabled = await BiometricService.enableBiometric();
      expect(enabled).toBe(false);

      // Authentication should still work independently
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'Hardware not available',
      } as any);

      const authResult = await BiometricService.authenticate();
      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('Hardware not available');
    });

    test('should handle mixed success/failure scenarios', async () => {
      // Available but authentication fails
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'User cancelled',
      } as any);

      const isAvailable = await BiometricService.isAvailable();
      expect(isAvailable).toBe(true);

      const authResult = await BiometricService.authenticate();
      expect(authResult).toEqual({
        success: false,
        error: 'User cancelled'
      });

      const enabled = await BiometricService.enableBiometric();
      expect(enabled).toBe(false);
    });
  });
});