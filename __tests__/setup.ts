import '@testing-library/jest-native/extend-expect';

// Mock expo-router with more comprehensive navigation mocking
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => false),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => false),
  },
  useSegments: () => [],
  usePathname: () => '/',
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  Link: 'Link',
  Redirect: 'Redirect',
  Slot: 'Slot',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
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

// Enhanced AsyncStorage mock with better promise handling
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {} as Record<string, string>;
  
  return {
    getItem: jest.fn((key) => {
      return Promise.resolve(store[key] || null);
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(store));
    }),
    multiGet: jest.fn((keys) => {
      return Promise.resolve(keys.map(key => [key, store[key] || null]));
    }),
    multiSet: jest.fn((keyValuePairs) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    _store: store,
  };
});

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

// Mock expo modules
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {},
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock React Native with manual implementation to avoid CSS interop issues
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  ActivityIndicator: 'ActivityIndicator',
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  StatusBar: {
    currentHeight: 24,
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
  },
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock additional Expo modules
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    type: 'success',
    uri: 'mock-uri',
    name: 'mock-document.pdf',
    size: 1024,
  })),
  DocumentPickerOptions: {},
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'mock-document-directory/',
  downloadAsync: jest.fn(() => Promise.resolve({ uri: 'mock-download-uri' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  readAsStringAsync: jest.fn(() => Promise.resolve('mock-file-content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  getEnrolledLevelAsync: jest.fn(() => Promise.resolve(2)),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
  },
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'GestureHandlerRootView',
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

jest.mock('react-native-reanimated', () => ({
  default: {
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
  },
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withTiming: jest.fn(),
  withSpring: jest.fn(),
  runOnJS: jest.fn(),
}));

// Mock axios for API calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock timers
jest.useFakeTimers();

// Enhanced global setup for better testing
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset console mocks
  (global.console.log as jest.Mock).mockClear();
  (global.console.warn as jest.Mock).mockClear();
  (global.console.error as jest.Mock).mockClear();
});