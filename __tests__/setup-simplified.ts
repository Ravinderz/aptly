// Simplified test setup for React Native without CSS interop conflicts
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((config) => config.ios || config.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
    TouchableOpacity: 'TouchableOpacity',
    Text: 'Text',
    View: 'View',
    ActivityIndicator: 'ActivityIndicator',
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: jest.fn((component) => component),
}));

// Mock cn utility
jest.mock('../utils/cn', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Silence warnings
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});