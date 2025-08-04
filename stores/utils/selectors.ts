// Reusable selectors for optimized store subscriptions

/**
 * Creates a selector that only subscribes to specific parts of the store
 * This prevents unnecessary re-renders when unrelated state changes
 */
export const createSelector = <T, R>(selector: (state: T) => R) => selector;

/**
 * Shallow comparison selector for objects
 * Use when selecting multiple primitive values that should be compared shallowly
 */
export const createShallowSelector = <T, R>(
  selector: (state: T) => R,
  compare: (a: R, b: R) => boolean = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => (a as any)[key] === (b as any)[key]);
  }
) => {
  return (state: T) => selector(state);
};

/**
 * Common selectors for base store functionality
 */
export const baseSelectors = {
  loading: <T extends { loading: boolean }>(state: T) => state.loading,
  error: <T extends { error: string | null }>(state: T) => state.error,
  hasError: <T extends { error: string | null }>(state: T) => !!state.error,
  isReady: <T extends { loading: boolean; error: string | null }>(state: T) => 
    !state.loading && !state.error,
};

/**
 * Creates a memoized selector that only recalculates when dependencies change
 */
export const createMemoizedSelector = <T, R, Args extends any[]>(
  selector: (state: T, ...args: Args) => R,
  dependencies: (state: T, ...args: Args) => any[] = () => []
) => {
  let lastDependencies: any[] = [];
  let lastResult: R;

  return (state: T, ...args: Args): R => {
    const currentDependencies = dependencies(state, ...args);
    
    if (
      lastDependencies.length !== currentDependencies.length ||
      !lastDependencies.every((dep, index) => dep === currentDependencies[index])
    ) {
      lastResult = selector(state, ...args);
      lastDependencies = currentDependencies;
    }

    return lastResult;
  };
};