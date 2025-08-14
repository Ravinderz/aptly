// Store monitoring and debugging utilities
import { StorageHealthMonitor } from './storageManager';

export interface StoreHealth {
  name: string;
  initialized: boolean;
  hasErrors: boolean;
  errorCount: number;
  lastError?: string;
  persistenceWorking: boolean;
  performanceMetrics: {
    avgResponseTime: number;
    slowOperations: number;
    failedOperations: number;
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  storage: {
    available: boolean;
    responsive: boolean;
    errors: string[];
  };
  stores: StoreHealth[];
  timestamp: number;
}

class StoreMonitorService {
  private storeRegistry = new Map<string, any>();
  private errorLog = new Map<string, string[]>();
  private performanceLog = new Map<string, number[]>();
  private monitoringInterval?: any;

  /**
   * Register a store for monitoring
   */
  registerStore(name: string, store: any) {
    console.log(`📊 Registering store for monitoring: ${name}`);
    this.storeRegistry.set(name, store);
    this.errorLog.set(name, []);
    this.performanceLog.set(name, []);
  }

  /**
   * Log an error for a specific store
   */
  logError(storeName: string, error: string) {
    const errors = this.errorLog.get(storeName) || [];
    errors.push(`${new Date().toISOString()}: ${error}`);
    
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.shift();
    }
    
    this.errorLog.set(storeName, errors);
    console.warn(`❌ Store error [${storeName}]:`, error);
  }

  /**
   * Log performance metrics for a store operation
   */
  logPerformance(storeName: string, operationTime: number) {
    const times = this.performanceLog.get(storeName) || [];
    times.push(operationTime);
    
    // Keep only last 20 measurements
    if (times.length > 20) {
      times.shift();
    }
    
    this.performanceLog.set(storeName, times);
    
    if (operationTime > 1000) {
      console.warn(`⚠️ Slow store operation [${storeName}]: ${operationTime}ms`);
    }
  }

  /**
   * Get health status for a specific store
   */
  private getStoreHealth(name: string, store: any): StoreHealth {
    const errors = this.errorLog.get(name) || [];
    const performanceTimes = this.performanceLog.get(name) || [];
    
    let initialized = false;
    let hasErrors = false;
    let persistenceWorking = true;

    try {
      const state = store.getState();
      initialized = true;
      hasErrors = !!state.error;
    } catch (error) {
      console.warn(`Failed to get state for store ${name}:`, error);
    }

    const avgResponseTime = performanceTimes.length > 0 
      ? performanceTimes.reduce((a, b) => a + b, 0) / performanceTimes.length 
      : 0;

    const slowOperations = performanceTimes.filter(time => time > 1000).length;
    const failedOperations = errors.length;

    return {
      name,
      initialized,
      hasErrors,
      errorCount: errors.length,
      lastError: errors[errors.length - 1],
      persistenceWorking,
      performanceMetrics: {
        avgResponseTime,
        slowOperations,
        failedOperations,
      },
    };
  }

  /**
   * Get overall system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const storeHealths: StoreHealth[] = [];
    
    // Check each registered store
    for (const [name, store] of this.storeRegistry.entries()) {
      try {
        const health = this.getStoreHealth(name, store);
        storeHealths.push(health);
      } catch (error) {
        console.error(`Failed to check health for store ${name}:`, error);
        storeHealths.push({
          name,
          initialized: false,
          hasErrors: true,
          errorCount: 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
          persistenceWorking: false,
          performanceMetrics: {
            avgResponseTime: 0,
            slowOperations: 0,
            failedOperations: 1,
          },
        });
      }
    }

    // Check storage health
    const storageHealth = await StorageHealthMonitor.checkHealth();

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    const criticalStores = storeHealths.filter(s => !s.initialized || s.errorCount > 5);
    const degradedStores = storeHealths.filter(s => s.hasErrors || s.performanceMetrics.slowOperations > 3);
    
    if (criticalStores.length > 0 || !storageHealth.available) {
      overall = 'critical';
    } else if (degradedStores.length > 0 || !storageHealth.responsive) {
      overall = 'degraded';
    }

    return {
      overall,
      storage: storageHealth,
      stores: storeHealths,
      timestamp: Date.now(),
    };
  }

  /**
   * Start monitoring all registered stores
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('🔍 Starting store monitoring...');
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        if (health.overall === 'critical') {
          console.error('🚨 CRITICAL: System health is critical!', {
            storage: health.storage,
            failedStores: health.stores.filter(s => !s.initialized || s.errorCount > 5),
          });
        } else if (health.overall === 'degraded') {
          console.warn('⚠️ WARNING: System health is degraded', {
            storage: health.storage,
            issues: health.stores.filter(s => s.hasErrors || s.performanceMetrics.slowOperations > 3),
          });
        } else {
          console.log('✅ System health check passed');
        }
      } catch (error) {
        console.error('❌ Health monitoring error:', error);
      }
    }, intervalMs);

    // Also start storage monitoring
    StorageHealthMonitor.startMonitoring(intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('🛑 Store monitoring stopped');
    }
  }

  /**
   * Performance wrapper for store operations
   */
  withPerformanceTracking<T>(storeName: string, operation: () => T | Promise<T>): T | Promise<T> {
    const start = Date.now();
    
    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            this.logPerformance(storeName, Date.now() - start);
            return value;
          })
          .catch((error) => {
            this.logPerformance(storeName, Date.now() - start);
            this.logError(storeName, error.message || 'Operation failed');
            throw error;
          });
      } else {
        this.logPerformance(storeName, Date.now() - start);
        return result;
      }
    } catch (error) {
      this.logPerformance(storeName, Date.now() - start);
      this.logError(storeName, error instanceof Error ? error.message : 'Operation failed');
      throw error;
    }
  }

  /**
   * Create a store wrapper with automatic monitoring
   */
  createMonitoredStore<T>(name: string, store: T): T {
    this.registerStore(name, store);
    
    // Wrap store methods with monitoring
    const wrappedStore = { ...store } as any;
    
    if (typeof wrappedStore.getState === 'function') {
      const originalGetState = wrappedStore.getState;
      wrappedStore.getState = () => {
        return this.withPerformanceTracking(name, originalGetState);
      };
    }

    return wrappedStore;
  }

  /**
   * Generate health report
   */
  async generateHealthReport(): Promise<string> {
    const health = await this.getSystemHealth();
    
    let report = `# Store Health Report (${new Date(health.timestamp).toISOString()})\n\n`;
    report += `**Overall Status:** ${health.overall.toUpperCase()}\n\n`;
    
    report += `## Storage Health\n`;
    report += `- Available: ${health.storage.available ? '✅' : '❌'}\n`;
    report += `- Responsive: ${health.storage.responsive ? '✅' : '❌'}\n`;
    if (health.storage.errors.length > 0) {
      report += `- Errors: ${health.storage.errors.join(', ')}\n`;
    }
    report += '\n';
    
    report += `## Store Health\n`;
    for (const store of health.stores) {
      report += `### ${store.name}\n`;
      report += `- Initialized: ${store.initialized ? '✅' : '❌'}\n`;
      report += `- Has Errors: ${store.hasErrors ? '❌' : '✅'}\n`;
      report += `- Error Count: ${store.errorCount}\n`;
      if (store.lastError) {
        report += `- Last Error: ${store.lastError}\n`;
      }
      report += `- Avg Response Time: ${store.performanceMetrics.avgResponseTime.toFixed(2)}ms\n`;
      report += `- Slow Operations: ${store.performanceMetrics.slowOperations}\n`;
      report += `- Failed Operations: ${store.performanceMetrics.failedOperations}\n`;
      report += '\n';
    }
    
    return report;
  }
}

// Global monitor instance
export const storeMonitor = new StoreMonitorService();

// Helper functions for easy integration
export const monitorStore = (name: string, store: any) => storeMonitor.registerStore(name, store);
export const logStoreError = (storeName: string, error: string) => storeMonitor.logError(storeName, error);
export const trackStorePerformance = (storeName: string, operationTime: number) => storeMonitor.logPerformance(storeName, operationTime);
export const startStoreMonitoring = (intervalMs?: number) => storeMonitor.startMonitoring(intervalMs);
export const getSystemHealthReport = () => storeMonitor.generateHealthReport();