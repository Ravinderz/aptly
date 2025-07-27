import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BiometricConfig {
  isEnabled: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = "biometric_enabled";
  private static readonly BIOMETRIC_USER_ID_KEY = "biometric_user_id";

  /**
   * Check if biometric authentication is available on the device
   */
  static async checkBiometricSupport(): Promise<BiometricConfig> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        isEnabled: await this.isBiometricEnabled(),
        hasHardware,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      console.error("Error checking biometric support:", error);
      return {
        isEnabled: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Authenticate user using biometrics
   */
  static async authenticateWithBiometrics(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const biometricConfig = await this.checkBiometricSupport();

      if (!biometricConfig.hasHardware) {
        return {
          success: false,
          error: "Biometric hardware not available on this device",
        };
      }

      if (!biometricConfig.isEnrolled) {
        return {
          success: false,
          error: "No biometric data enrolled on this device",
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access Aptly",
        fallbackLabel: "Use PIN/Password",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return {
        success: false,
        error: "Authentication failed",
      };
    }
  }

  /**
   * Enable biometric authentication for a user
   */
  static async enableBiometricAuth(userId: string): Promise<boolean> {
    try {
      const authResult = await this.authenticateWithBiometrics();
      
      if (authResult.success) {
        await AsyncStorage.multiSet([
          [this.BIOMETRIC_ENABLED_KEY, "true"],
          [this.BIOMETRIC_USER_ID_KEY, userId],
        ]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error enabling biometric auth:", error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometricAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.BIOMETRIC_ENABLED_KEY,
        this.BIOMETRIC_USER_ID_KEY,
      ]);
    } catch (error) {
      console.error("Error disabling biometric auth:", error);
    }
  }

  /**
   * Check if biometric authentication is enabled for the current user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === "true";
    } catch (error) {
      console.error("Error checking biometric status:", error);
      return false;
    }
  }

  /**
   * Get the user ID associated with biometric authentication
   */
  static async getBiometricUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.BIOMETRIC_USER_ID_KEY);
    } catch (error) {
      console.error("Error getting biometric user ID:", error);
      return null;
    }
  }

  /**
   * Get biometric type display name
   */
  static getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    return "Biometric";
  }
}

export default BiometricService;