/**
 * Performance Utilities
 * Comprehensive performance optimization utilities for React Native
 */

import React from 'react';
import { InteractionManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// MEMORY CACHE SYSTEM
// ============================================================================

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
  accessCount: number;
  lastAccess: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  version?: string; // Version for cache invalidation
  persistent?: boolean; // Store in AsyncStorage
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private accessOrder = new Map<string, number>();
  private currentTime = 0;
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || this.defaultTTL;
    
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      version: options.version || '1.0.0',
      accessCount: 0,
      lastAccess: now,
    };

    // Store in memory
    this.cache.set(key, item);
    this.accessOrder.set(key, this.currentTime++);

    // Store persistently if requested
    if (options.persistent) {
      this.setPersistent(key, item);
    }

    // Cleanup if needed
    this.cleanup();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;

    const now = Date.now();
    
    // Check if expired
    if (now > item.expiry) {
      this.delete(key);
      return null;
    }

    // Update access stats
    item.accessCount++;
    item.lastAccess = now;
    this.accessOrder.set(key, this.currentTime++);

    return item.data;
  }

  async getWithFallback<T>(
    key: string, 
    fallback: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    // Try memory cache first
    let data = this.get<T>(key);
    if (data) return data;

    // Try persistent cache if enabled
    if (options.persistent) {
      data = await this.getPersistent<T>(key);
      if (data) {
        // Restore to memory cache
        this.set(key, data, options);
        return data;
      }
    }

    // Fallback to data source
    data = await fallback();
    this.set(key, data, options);
    return data;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    // Remove from persistent storage
    this.deletePersistent(key);
    
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.currentTime = 0;
  }

  invalidate(pattern?: RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  getStats() {
    const items = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired: items.filter(([, item]) => now > item.expiry).length,
      averageAge: items.reduce((sum, [, item]) => sum + (now - item.timestamp), 0) / items.length || 0,
      mostAccessed: items.sort((a, b) => b[1].accessCount - a[1].accessCount)[0]?.[0],
    };
  }

  private cleanup(): void {
    if (this.cache.size <= this.maxSize) return;

    // Remove expired items first
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.delete(key);
      }
    }

    // If still over limit, remove least recently used items
    if (this.cache.size > this.maxSize) {
      const sorted = Array.from(this.accessOrder.entries())
        .sort((a, b) => a[1] - b[1]);
      
      const itemsToRemove = sorted.slice(0, this.cache.size - this.maxSize);
      itemsToRemove.forEach(([key]) => this.delete(key));
    }
  }

  private async setPersistent<T>(key: string, item: CacheItem<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `cache:${key}`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('Failed to set persistent cache:', error);
    }
  }

  private async getPersistent<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(`cache:${key}`);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();

      // Check if expired
      if (now > item.expiry) {
        await AsyncStorage.removeItem(`cache:${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to get persistent cache:', error);
      return null;
    }
  }

  private async deletePersistent(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache:${key}`);
    } catch (error) {
      console.warn('Failed to delete persistent cache:', error);
    }
  }
}

// Global cache instance
export const cache = new MemoryCache(200, 10 * 60 * 1000); // 200 items, 10 minutes TTL

// ============================================================================
// REACT MEMOIZATION UTILITIES
// ============================================================================

/**
 * Enhanced React.memo with deep comparison option
 */
export function memo<T extends React.ComponentType<any>>(
  Component: T,
  options: {
    deep?: boolean;
    ignoreProps?: string[];
    debug?: boolean;
  } = {}
): T {
  const { deep = false, ignoreProps = [], debug = false } = options;

  const areEqual = (prevProps: any, nextProps: any): boolean => {
    if (debug) {
      console.log('Memo comparison:', { prevProps, nextProps });
    }

    // Filter out ignored props
    const filterProps = (props: any) => {
      if (ignoreProps.length === 0) return props;
      const filtered = { ...props };
      ignoreProps.forEach(prop => delete filtered[prop]);
      return filtered;
    };

    const prev = filterProps(prevProps);
    const next = filterProps(nextProps);

    if (deep) {
      return deepEqual(prev, next);
    }

    return shallowEqual(prev, next);
  };

  return React.memo(Component, areEqual) as T;
}

/**
 * Memoized selector hook for complex state
 */
export function useMemoSelector<T, R>(
  selector: (state: T) => R,
  state: T,
  deps?: React.DependencyList
): R {
  return React.useMemo(
    () => selector(state),
    deps || [state]
  );
}

/**
 * Debounced state hook for performance
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return [debouncedValue, setValue, value];
}

// ============================================================================
// LIST PERFORMANCE UTILITIES
// ============================================================================

/**
 * Virtualized list data structure
 */
export interface VirtualizedItem {
  id: string;
  height?: number;
  data: any;
}

export interface VirtualizationConfig {
  itemHeight: number;
  bufferSize: number;
  overscan: number;
}

export function useVirtualization(
  items: VirtualizedItem[],
  config: VirtualizationConfig,
  scrollOffset: number,
  containerHeight: number
) {
  return React.useMemo(() => {
    const { itemHeight, bufferSize, overscan } = config;
    
    const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollOffset + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      visibleItems,
      totalHeight,
      offsetY,
      startIndex,
      endIndex,
    };
  }, [items, config, scrollOffset, containerHeight]);
}

/**
 * Optimized key generator for list items
 */
export const getItemKey = (item: any, index: number): string => {
  if (item && typeof item === 'object') {
    return item.id || item.key || item._id || String(index);
  }
  return String(index);
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  measure(name: string, fn: () => void, metadata?: Record<string, any>): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    this.addMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
      metadata,
    });
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.addMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
      metadata,
    });

    return result;
  }

  markInteraction(name: string): void {
    InteractionManager.runAfterInteractions(() => {
      this.addMetric({
        name: `interaction:${name}`,
        value: 0,
        timestamp: Date.now(),
      });
    });
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  getReport(): Record<string, any> {
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).reduce((report, [name, values]) => {
      report[name] = {
        count: values.length,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: values.sort()[Math.floor(values.length / 2)],
      };
      return report;
    }, {} as Record<string, any>);
  }

  clear(): void {
    this.metrics = [];
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

/**
 * Hook to measure component render performance
 */
export function useRenderTime(componentName: string): void {
  const renderStart = React.useRef<number>();
  
  React.useLayoutEffect(() => {
    renderStart.current = performance.now();
  });

  React.useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      performanceMonitor.addMetric({
        name: `render:${componentName}`,
        value: renderTime,
        timestamp: Date.now(),
      });
    }
  });
}

/**
 * Hook for performance-optimized callbacks
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  delay = 0
): T {
  const callbackRef = React.useRef(callback);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Update callback ref
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback(
    ((...args: any[]) => {
      if (delay > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      } else {
        callbackRef.current(...args);
      }
    }) as T,
    deps
  );
}

// ============================================================================
// BUNDLE SIZE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Lazy import with error boundary
 */
export function lazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): T {
  const LazyComponent = React.lazy(importFn);
  
  const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? React.createElement(fallback) : null}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  )) as T;

  WrappedComponent.displayName = 'LazyImport';
  return WrappedComponent;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// ============================================================================
// PLATFORM-SPECIFIC OPTIMIZATIONS
// ============================================================================

export const platformOptimizations = {
  // iOS specific optimizations
  ios: {
    shouldUseNativeDriver: true,
    shouldOptimizeUpdates: true,
    enableHermes: true,
  },
  
  // Android specific optimizations
  android: {
    shouldUseNativeDriver: true,
    shouldOptimizeUpdates: true,
    enableProGuard: true,
    enableR8: true,
  },
  
  // Current platform optimizations
  current: Platform.select({
    ios: {
      shouldUseNativeDriver: true,
      shouldOptimizeUpdates: true,
      enableHermes: true,
    },
    android: {
      shouldUseNativeDriver: true,
      shouldOptimizeUpdates: true,
      enableProGuard: true,
      enableR8: true,
    },
    default: {
      shouldUseNativeDriver: false,
      shouldOptimizeUpdates: false,
    },
  }),
};