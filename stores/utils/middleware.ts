// Custom middleware utilities for Zustand stores

/**
 * Error handling middleware that wraps store actions
 * Automatically catches errors and sets error state
 */
export const createErrorMiddleware = (storeName: string) => 
  <T>(config: (set: any, get: any, api: any) => T) => 
    (set: any, get: any, api: any) => ({
      ...config(
        (fn: any) => {
          try {
            if (typeof fn === 'function') {
              const result = fn(get());
              if (result && typeof result.then === 'function') {
                // Handle async operations
                return result.catch((error: Error) => {
                  console.error(`Error in ${storeName}:`, error);
                  set((state: any) => ({ 
                    ...state, 
                    error: error.message,
                    loading: false 
                  }));
                  throw error;
                });
              }
              set(result);
            } else {
              set(fn);
            }
          } catch (error: any) {
            console.error(`Error in ${storeName}:`, error);
            set((state: any) => ({ 
              ...state, 
              error: error.message,
              loading: false 
            }));
            throw error;
          }
        },
        get,
        api
      ),
    });

/**
 * Loading middleware that automatically handles loading states
 */
export const createLoadingMiddleware = () =>
  <T>(config: (set: any, get: any, api: any) => T) =>
    (set: any, get: any, api: any) => {
      const wrappedSet = (updater: any) => {
        if (typeof updater === 'function') {
          const result = updater(get());
          // Auto-detect async actions and set loading state
          if (result && typeof result.then === 'function') {
            set((state: any) => ({ ...state, loading: true, error: null }));
            return result.finally(() => {
              set((state: any) => ({ ...state, loading: false }));
            });
          }
          set(result);
        } else {
          set(updater);
        }
      };

      return config(wrappedSet, get, api);
    };

/**
 * Validation middleware that validates state updates
 */
export const createValidationMiddleware = <T>(
  validator: (state: T) => boolean | string
) =>
  (config: (set: any, get: any, api: any) => T) =>
    (set: any, get: any, api: any) => {
      const wrappedSet = (updater: any) => {
        const newState = typeof updater === 'function' ? updater(get()) : updater;
        const validationResult = validator(newState);
        
        if (validationResult === true) {
          set(updater);
        } else {
          const errorMessage = typeof validationResult === 'string' 
            ? validationResult 
            : 'State validation failed';
          console.error('State validation failed:', errorMessage);
          set((state: any) => ({ ...state, error: errorMessage }));
        }
      };

      return config(wrappedSet, get, api);
    };

/**
 * Reset functionality middleware
 */
export const createResetMiddleware = <T>(initialState: T) =>
  (config: (set: any, get: any, api: any) => T) =>
    (set: any, get: any, api: any) => ({
      ...config(set, get, api),
      reset: () => set(initialState),
    });