import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Expo Vector Icons removed - using Lucide React Native instead

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  ImagePickerResult: {},
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  User: 'User',
  Users: 'Users',
  Car: 'Car',
  FileText: 'FileText',
  Bell: 'Bell',
  Phone: 'Phone',
  Shield: 'Shield',
  LogOut: 'LogOut',
  HelpCircle: 'HelpCircle',
  Settings: 'Settings',
  Camera: 'Camera',
  Vote: 'Vote',
  BarChart3: 'BarChart3',
  Home: 'Home',
  Calendar: 'Calendar',
  Clock: 'Clock',
  Plus: 'Plus',
  Receipt: 'Receipt',
  TrendingUp: 'TrendingUp',
  Wrench: 'Wrench',
  AlertTriangle: 'AlertTriangle',
  CheckCircle: 'CheckCircle',
  XCircle: 'XCircle',
  Info: 'Info',
}));

// Mock NativeWind
jest.mock('nativewind', () => ({}));

// Mock react-native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
  };
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();