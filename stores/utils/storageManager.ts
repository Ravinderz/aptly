// Storage Manager - Robust AsyncStorage handling for Zustand persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Safe JSON serialization with fallback for non-serializable data
 */
export const safeStringify = (value: any): string => {
  try {
    return JSON.stringify(value, (key, val) => {
      // Handle circular references and non-serializable objects
      if (val && typeof val === 'object') {
        // Check for ReadableNativeMap or similar React Native objects
        if (val.constructor && val.constructor.name && 
            (val.constructor.name.includes('Native') || val.constructor.name.includes('Readable'))) {
          // Convert to plain object
          const plainObj: any = {};
          try {
            Object.keys(val).forEach(k => {
              plainObj[k] = val[k];
            });
            return plainObj;
          } catch {
            return {}; // Return empty object if conversion fails
          }
        }
      }
      return val;
    });
  } catch (error) {
    console.warn('Failed to stringify value, using fallback:', error);
    // Return a minimal fallback representation
    if (value && typeof value === 'object') {
      return JSON.stringify({ _fallback: true, _type: typeof value });
    }
    return JSON.stringify(value?.toString() || null);
  }
};

/**
 * Safe JSON parsing with error handling
 */
export const safeParse = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON value:', error);
    return null;
  }
};

export interface StorageManager {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiGet: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  clear: () => Promise<void>;
}

/**
 * Storage availability checker
 */
export const isStorageAvailable = async (): Promise<boolean> => {
  try {
    const testKey = '@aptly_storage_test';
    const testValue = 'test';
    
    await AsyncStorage.setItem(testKey, testValue);
    const retrieved = await AsyncStorage.getItem(testKey);
    await AsyncStorage.removeItem(testKey);
    
    return retrieved === testValue;
  } catch (error) {
    console.warn('⚠️ AsyncStorage availability check failed:', error);
    return false;
  }
};

/**
 * Storage initializer - ensures AsyncStorage is ready
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing AsyncStorage...');
    
    // Wait a bit for storage to be ready (especially on app startup)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const isAvailable = await isStorageAvailable();
    
    if (isAvailable) {
      console.log('✅ AsyncStorage is ready and functional');
      return true;
    } else {
      console.warn('⚠️ AsyncStorage is not available, stores will run in memory-only mode');
      return false;
    }
  } catch (error) {
    console.error('❌ AsyncStorage initialization failed:', error);
    return false;
  }
};

/**
 * Creates a storage manager for Zustand persistence
 * Alias for createSafeStorage to match Zustand naming conventions
 */
export const createStorageManager = (storeName: string): StorageManager => {
  return createSafeStorage(storeName);
};

/**
 * Creates a safe storage wrapper with error handling and fallbacks
 */
export const createSafeStorage = (storeName: string): StorageManager => {
  let storageAvailable = true;
  let memoryFallback: Map<string, string> = new Map();

  const checkAndFallback = async (operation: string, key?: string) => {
    if (!storageAvailable) {
      console.warn(`⚠️ ${storeName}: Storage unavailable, using memory fallback for ${operation}${key ? ` (${key})` : ''}`);
      return false;
    }
    return true;
  };

  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        if (await checkAndFallback('getItem', key)) {
          const result = await AsyncStorage.getItem(key);
          console.log(`📖 ${storeName}: Retrieved item '${key}' from storage`);
          return result;
        } else {
          return memoryFallback.get(key) || null;
        }
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to get item '${key}', falling back to memory:`, error);
        storageAvailable = false;
        return memoryFallback.get(key) || null;
      }
    },

    setItem: async (key: string, value: string): Promise<void> => {
      try {
        if (await checkAndFallback('setItem', key)) {
          // Ensure value is a string and properly serialized
          const serializedValue = typeof value === 'string' ? value : safeStringify(value);
          await AsyncStorage.setItem(key, serializedValue);
          console.log(`💾 ${storeName}: Stored item '${key}' to storage`);
          // Also store in memory as backup
          memoryFallback.set(key, serializedValue);
        } else {
          const serializedValue = typeof value === 'string' ? value : safeStringify(value);
          memoryFallback.set(key, serializedValue);
        }
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to set item '${key}', using memory fallback:`, error);
        storageAvailable = false;
        const serializedValue = typeof value === 'string' ? value : safeStringify(value);
        memoryFallback.set(key, serializedValue);
        // Don't throw error - allow app to continue
      }
    },

    removeItem: async (key: string): Promise<void> => {
      try {
        if (await checkAndFallback('removeItem', key)) {
          await AsyncStorage.removeItem(key);
          console.log(`🗑️ ${storeName}: Removed item '${key}' from storage`);
        }
        memoryFallback.delete(key);
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to remove item '${key}':`, error);
        storageAvailable = false;
        memoryFallback.delete(key);
        // Don't throw error - allow app to continue
      }
    },

    multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
      try {
        if (await checkAndFallback('multiGet')) {
          const result = await AsyncStorage.multiGet(keys);
          console.log(`📖 ${storeName}: Retrieved ${keys.length} items from storage`);
          return result as [string, string | null][];
        } else {
          return keys.map(key => [key, memoryFallback.get(key) || null]);
        }
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to get multiple items, falling back to memory:`, error);
        storageAvailable = false;
        return keys.map(key => [key, memoryFallback.get(key) || null]);
      }
    },

    multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
      try {
        if (await checkAndFallback('multiSet')) {
          await AsyncStorage.multiSet(keyValuePairs);
          console.log(`💾 ${storeName}: Stored ${keyValuePairs.length} items to storage`);
        }
        // Always store in memory as backup
        keyValuePairs.forEach(([key, value]) => {
          memoryFallback.set(key, value);
        });
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to set multiple items, using memory fallback:`, error);
        storageAvailable = false;
        keyValuePairs.forEach(([key, value]) => {
          memoryFallback.set(key, value);
        });
        // Don't throw error - allow app to continue
      }
    },

    multiRemove: async (keys: string[]): Promise<void> => {
      try {
        if (await checkAndFallback('multiRemove')) {
          await AsyncStorage.multiRemove(keys);
          console.log(`🗑️ ${storeName}: Removed ${keys.length} items from storage`);
        }
        keys.forEach(key => {
          memoryFallback.delete(key);
        });
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to remove multiple items:`, error);
        storageAvailable = false;
        keys.forEach(key => {
          memoryFallback.delete(key);
        });
        // Don't throw error - allow app to continue
      }
    },

    getAllKeys: async (): Promise<string[]> => {
      try {
        if (await checkAndFallback('getAllKeys')) {
          const keys = await AsyncStorage.getAllKeys();
          console.log(`🔑 ${storeName}: Retrieved ${keys.length} keys from storage`);
          return keys as string[];
        } else {
          return Array.from(memoryFallback.keys());
        }
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to get all keys, falling back to memory:`, error);
        storageAvailable = false;
        return Array.from(memoryFallback.keys());
      }
    },

    clear: async (): Promise<void> => {
      try {
        if (await checkAndFallback('clear')) {
          await AsyncStorage.clear();
          console.log(`🧹 ${storeName}: Cleared all storage`);
        }
        memoryFallback.clear();
      } catch (error) {
        console.warn(`⚠️ ${storeName}: Failed to clear storage:`, error);
        storageAvailable = false;
        memoryFallback.clear();
        // Don't throw error - allow app to continue
      }
    },
  };
};

/**
 * Storage recovery utilities
 */
export const StorageRecovery = {
  /**
   * Attempts to recover from storage corruption
   */
  recoverFromCorruption: async (storeName: string): Promise<boolean> => {
    try {
      console.log(`🔧 Attempting to recover corrupted storage for: ${storeName}`);
      
      // Clear potentially corrupted data
      await AsyncStorage.removeItem(storeName);
      
      // Test if storage is working now
      const isWorking = await isStorageAvailable();
      
      if (isWorking) {
        console.log(`✅ Storage recovery successful for: ${storeName}`);
        return true;
      } else {
        console.warn(`⚠️ Storage recovery failed for: ${storeName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Storage recovery error for ${storeName}:`, error);
      return false;
    }
  },

  /**
   * Emergency storage reset
   */
  emergencyReset: async (): Promise<void> => {
    try {
      console.log('🚨 Performing emergency storage reset...');
      
      // Get all keys first
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter to only app-specific keys
      const appKeys = allKeys.filter(key => 
        key.startsWith('@aptly') || 
        key.includes('feature-flags') || 
        key.includes('auth-storage')
      );
      
      // Remove app-specific keys
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
        console.log(`🧹 Removed ${appKeys.length} app storage keys`);
      }
      
      console.log('✅ Emergency storage reset completed');
    } catch (error) {
      console.error('❌ Emergency storage reset failed:', error);
      // As last resort, try full clear
      try {
        await AsyncStorage.clear();
        console.log('✅ Full storage clear completed as fallback');
      } catch (clearError) {
        console.error('❌ Even full storage clear failed:', clearError);
      }
    }
  },
};

/**
 * Storage health monitoring
 */
export const StorageHealthMonitor = {
  /**
   * Checks storage health and reports issues
   */
  checkHealth: async (): Promise<{
    available: boolean;
    responsive: boolean;
    errors: string[];
  }> => {
    const errors: string[] = [];
    let available = false;
    let responsive = false;

    try {
      // Test availability
      available = await isStorageAvailable();
      if (!available) {
        errors.push('Storage is not available');
      }

      // Test responsiveness
      const start = Date.now();
      await AsyncStorage.getItem('@health_check');
      const duration = Date.now() - start;
      
      responsive = duration < 1000; // Should respond within 1 second
      if (!responsive) {
        errors.push(`Storage is slow (${duration}ms response time)`);
      }

    } catch (error: any) {
      errors.push(`Storage health check failed: ${error.message}`);
    }

    return { available, responsive, errors };
  },

  /**
   * Monitors storage performance over time
   */
  startMonitoring: (intervalMs: number = 60000) => {
    return setInterval(async () => {
      const health = await StorageHealthMonitor.checkHealth();
      
      if (health.errors.length > 0) {
        console.warn('⚠️ Storage health issues detected:', health.errors);
      } else {
        console.log('✅ Storage health check passed');
      }
    }, intervalMs);
  },
};