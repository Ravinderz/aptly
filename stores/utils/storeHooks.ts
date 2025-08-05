// React 18+ compatible store hooks with cached selectors
import { useSyncExternalStore } from 'react';
import { useCallback, useMemo } from 'react';

/**
 * Creates a stable selector function that prevents getSnapshot infinite loops
 * This is specifically designed for React 18+ compatibility with Zustand
 * Fixed: Moved caching outside of React render cycle
 */
export function createStableSelector<TState extends object, TSlice>(
  selector: (state: TState) => TSlice,
  equalityFn?: (a: TSlice, b: TSlice) => boolean
) {
  // Use a WeakMap to cache selector results by state object - moved outside useCallback
  const cache = new WeakMap<TState, TSlice>();
  
  // Return the selector function directly, not wrapped in useCallback
  return (state: TState): TSlice => {
    // Check if we have a cached result for this exact state object
    if (cache.has(state)) {
      const cached = cache.get(state)!;
      
      // If we have an equality function, check if the new result is different
      if (equalityFn) {
        const newResult = selector(state);
        if (equalityFn(cached, newResult)) {
          return cached;
        } else {
          cache.set(state, newResult);
          return newResult;
        }
      }
      
      return cached;
    }
    
    // Calculate new result and cache it
    const result = selector(state);
    cache.set(state, result);
    return result;
  };
}

/**
 * React 18+ compatible store subscription hook
 * Prevents getSnapshot infinite loops by using stable selectors
 * Fixed: Proper selector caching and stable references
 */
export function useStoreWithSelector<TState extends object, TSlice>(
  store: {
    getState: () => TState;
    subscribe: (listener: () => void) => () => void;
  },
  selector: (state: TState) => TSlice,
  equalityFn?: (a: TSlice, b: TSlice) => boolean
): TSlice {
  // Create stable selector outside of render cycle with proper memoization
  const stableSelector = useMemo(
    () => createStableSelector(selector, equalityFn),
    [selector, equalityFn]
  );
  
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return store.subscribe(onStoreChange);
    },
    [store]
  );
  
  const getSnapshot = useCallback(() => {
    return stableSelector(store.getState());
  }, [store, stableSelector]);
  
  const getServerSnapshot = useCallback(() => {
    // For SSR compatibility, return the current state
    return stableSelector(store.getState());
  }, [store, stableSelector]);
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Creates cached action selectors to prevent unnecessary re-renders
 */
export function createActionSelector<TState, TActions>(
  store: {
    getState: () => TState;
  },
  actionSelector: (state: TState) => TActions
): TActions {
  return useMemo(() => {
    return actionSelector(store.getState());
  }, [store, actionSelector]);
}

/**
 * Shallow equality comparison for objects
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is((a as any)[key], (b as any)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Deep equality comparison (use sparingly for performance)
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual((a as any)[key], (b as any)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Store subscription hook with built-in error boundary
 */
export function useSafeStoreSelector<TState extends object, TSlice>(
  store: {
    getState: () => TState;
    subscribe: (listener: () => void) => () => void;
  },
  selector: (state: TState) => TSlice,
  fallback: TSlice,
  equalityFn?: (a: TSlice, b: TSlice) => boolean
): TSlice {
  try {
    return useStoreWithSelector(store, selector, equalityFn);
  } catch (error) {
    console.warn('Store selector error, using fallback:', error);
    return fallback;
  }
}

/**
 * Hook to check if store is hydrated (for persistence)
 */
export function useStoreHydration<TState extends object>(
  store: {
    getState: () => TState;
    subscribe: (listener: () => void) => () => void;
  },
  hasHydrated: (state: TState) => boolean
): boolean {
  return useStoreWithSelector(store, hasHydrated);
}

/**
 * Loading state aggregator for multiple stores
 */
export function useAggregatedLoading(...loadingValues: boolean[]): boolean {
  return useMemo(() => {
    return loadingValues.some(loading => loading === true);
  }, [loadingValues]);
}

/**
 * Error state aggregator for multiple stores
 */
export function useAggregatedErrors(...errorValues: (string | null)[]): string[] {
  return useMemo(() => {
    return errorValues.filter((error): error is string => error !== null && error !== '');
  }, [errorValues]);
}