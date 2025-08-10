# Maestro E2E Testing

This directory contains Maestro end-to-end tests for the Aptly mobile application.

## Prerequisites

1. **Maestro CLI**: Install Maestro CLI if not already installed:

   ```bash
   curl -Ls 'https://get.maestro.mobile.dev' | bash
   ```

2. **Expo Development Build**: Make sure you have a development build of the app running on a simulator or device.

## Directory Structure

```
maestro/
├── config/                 # Maestro configuration files
│   ├── maestro.yaml       # Main configuration
│   └── environments/      # Environment-specific configs
├── flows/                 # Test flow files
│   ├── auth/             # Authentication tests
│   ├── navigation/       # Navigation tests
│   ├── admin/            # Admin functionality tests
│   ├── community/        # Community feature tests
│   └── visitor/          # Visitor management tests
├── helpers/              # Reusable test utilities
│   ├── common.yaml       # Common helpers
│   ├── auth-helpers.yaml # Authentication helpers
│   └── navigation-helpers.yaml # Navigation helpers
├── data/                 # Test data files
│   ├── test-users.yaml   # Test user data
│   └── test-content.yaml # Test content data
└── scripts/              # Execution scripts
    ├── setup.sh          # Environment setup
    └── run-tests.sh      # Test execution
```

## Quick Start

1. **Setup the test environment:**

   ```bash
   npm run e2e:setup
   ```

2. **Run all tests (development environment):**

   ```bash
   npm run e2e:test:dev
   ```

3. **Run specific test flows:**

   ```bash
   npm run e2e:test:auth        # Authentication flows
   npm run e2e:test:navigation  # Navigation tests
   ```

4. **Run tests with verbose output:**

   ```bash
   npm run e2e:test:verbose
   ```

## Available Scripts

- `npm run e2e:setup` - Set up the test environment
- `npm run e2e:test` - Run all tests (default environment)
- `npm run e2e:test:dev` - Run tests against development environment
- `npm run e2e:test:staging` - Run tests against staging environment
- `npm run e2e:test:auth` - Run authentication flow tests
- `npm run e2e:test:navigation` - Run navigation tests
- `npm run e2e:test:verbose` - Run tests with verbose output

## Environment Configuration

Tests can be run against different environments by using environment-specific configuration files:

- `development.yaml` - Local development server
- `staging.yaml` - Staging environment
- `production.yaml` - Production-like testing environment

## Test Data

Test data is managed through YAML files in the `data/` directory:

- `test-users.yaml` - Contains test user accounts for different roles
- `test-content.yaml` - Contains test content like posts, notices, and visitor data

## Writing Tests

When writing new tests:

1. Use the established testID naming convention: `{screen}.{component}.{element}`
2. Leverage helper functions from the `helpers/` directory
3. Use appropriate test data from the `data/` directory
4. Follow the DRY principle by creating reusable utilities

## Troubleshooting

1. **App not found**: Make sure your Expo development build is running
2. **Element not found**: Verify testIDs are correctly implemented in the app
3. **Timeout errors**: Check if loading states are properly handled
4. **Environment issues**: Verify environment variables are correctly set

For more detailed troubleshooting, run tests with the `--verbose` flag to get detailed output.
