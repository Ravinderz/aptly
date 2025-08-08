module.exports = {
  preset: 'jest-expo',
  displayName: 'Aptly Mobile App',
  
  // Setup files
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/utils/testUtils.enhanced.ts',
  ],
  
  // Transform settings
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|zustand|immer|@react-native-async-storage)',
  ],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],
  
  // Coverage settings
  collectCoverage: false, // Disabled by default, enable via --coverage flag
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'stores/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/jest.config.js',
    '!**/*.config.{js,ts}',
    '!**/deprecated/**',
    '!**/__tests__/**',
  ],
  
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './services/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './utils/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './hooks/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output for CI
  verbose: process.env.CI === 'true',
  
  // Performance settings
  maxWorkers: process.env.CI ? 1 : '50%',
  
  // Watch settings
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/.expo/',
    '<rootDir>/builds/',
  ],
  
  // Global settings
  globals: {
    __DEV__: true,
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test projects for different types of tests
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: ['<rootDir>/__tests__/integration/'],
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}'],
      testTimeout: 30000,
    },
    {
      displayName: 'Component Tests',
      testMatch: ['<rootDir>/__tests__/components/**/*.test.{js,jsx,ts,tsx}'],
    },
  ],
};