import { router } from 'expo-router';

export const resetNavigationAndNavigate = (path: any) => {
  // Navigate to home first to reset any accumulated navigation stack
  router.push('/(tabs)');

  // Small delay to ensure the navigation is processed
  setTimeout(() => {
    router.push(path);
  }, 50);
};

export const navigateWithReset = (path: any) => {
  // Use replace instead of push to avoid accumulating history
  router.replace(path);
};

export const safeGoBack = (fallbackPath: any = '/(tabs)') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackPath);
  }
};
