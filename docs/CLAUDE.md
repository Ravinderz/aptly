# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aptly is a React Native mobile app built with Expo for housing society management in India. The app targets societies under 100 units and focuses on GST-compliant billing, maintenance management, visitor management, community features, and vendor management.

**Tech Stack:**
- React Native with Expo SDK 53
- TypeScript with strict mode enabled
- NativeWind (Tailwind CSS for React Native)
- Expo Router v5 with file-based routing and typed routes
- React Hook Form for form handling
- Axios for API communication with centralized service
- AsyncStorage for local data persistence
- Jest with React Native Testing Library for testing

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Start on specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser

# Build commands
npm run build:android           # EAS build for Android (development profile)
npm run build:android-apk      # EAS build APK (development profile)
npm run build:android-local    # Local Android build
npm run build:android-preview  # EAS preview build (local)

# Testing
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Type checking and linting
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint with Expo config

# Reset project (moves starter to app-example/)
npm run reset-project
```

## Project Architecture

### Routing Structure (Expo Router)
- File-based routing using Expo Router v5
- Main navigation: `app/(tabs)/` - contains bottom tab structure
- Authentication flow: `app/auth/` - phone registration, OTP verification, profile setup
- Entry point: `app/_layout.tsx` with AuthProvider wrapper

### Key Architecture Patterns

**Authentication Flow:**
- Context-based auth state management in `contexts/AuthContext.tsx`
- Token-based authentication with refresh token handling
- Service layer: `services/auth.service.ts`

**API Layer:**
- Centralized API service with interceptors in `services/api.service.ts`
- Automatic token refresh and retry logic
- Offline request queueing capability
- Base URL: `https://api.aptly.app/v4`

**UI Components:**
- Design system components in `components/ui/`
- Custom Tailwind config with Indian-specific color palette
- Typography system with display/headline/body/label variants
- Reusable cards, buttons, inputs following design system

### State Management
- React Context for authentication state
- Local component state with hooks
- AsyncStorage for persistence (tokens, user profile)

### Styling System
- NativeWind (Tailwind CSS for React Native)
- Custom design system with Indian color palette:
  - Primary: Indigo (#6366f1)
  - Secondary: India Green (#4CAF50)
  - Professional neutral foundation
- Typography scale: display-large to label-large
- Custom font families: Inter, Noto Sans

## Feature Implementation Status

**Completed:**
- Visitor management (add, approve, QR codes)
- Authentication flow (phone + OTP)
- Home dashboard with notices and quick actions
- Basic UI components and design system

**In Development:**
- Services tab (maintenance, billing, vendors)
- Community tab (posts, comments, mentions)
- Settings and profile management

## Important Implementation Notes

**File Structure:**
- `app/(tabs)/` - Main app screens with bottom tabs
- `components/ui/` - Reusable UI components following design system
- `services/` - API and business logic layers
- `contexts/` - React contexts for global state
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

**API Integration:**
- Centralized `APIService` singleton with interceptors in `services/api.service.ts`
- Automatic token refresh and retry logic with exponential backoff
- Network state awareness with offline request queueing
- Base URL: `https://api.aptly.app/v4`
- File upload support with progress tracking
- Error handling with custom `APIError` interface

**Design System:**
- Use existing UI components in `components/ui/`
- Follow the established color palette and typography
- Maintain consistency with NativeWind classes
- Prefer composition over prop drilling for component variants

**Testing Framework:**
- Jest with React Native Testing Library configured
- Test setup file: `__tests__/setup.ts` with mocks for Expo modules
- Coverage collection enabled for TypeScript files
- Mock configurations for common React Native and Expo components
- Tests organized by feature: components/, screens/, utils/, admin/

**Code Quality:**
- TypeScript strict mode enabled with path aliases (`@/*` maps to project root)
- ESLint with Expo configuration
- Expo's new architecture enabled for better performance

## Advanced Features

**Admin System:**
- Multi-society management with role-based access control (RBAC)
- Adaptive admin layout with permission gates
- Dynamic navigation based on user roles
- Components in `components/admin/` with index exports

**Analytics & Governance:**
- Built-in analytics dashboard with audit system
- Voting system with emergency management
- Policy governance with succession management
- Performance optimization components

**Multi-Context Architecture:**
- `AuthContext` - Authentication state and user management
- `AdminContext` - Admin-specific state and multi-society management
- `AnalyticsContext` - Analytics data and performance tracking
- `GovernanceContext` - Voting, policies, and emergency management
- `SocietyContext` - Society-specific data and settings

## Critical Navigation Architecture

**AppNavigator Flow:**
The app uses a sophisticated navigation pattern with `AppNavigator.tsx` that manages:
- First launch detection (onboarding flow)
- Authentication state routing
- Automatic route redirects based on auth status
- Splash screen management during initialization

**Header System Architecture:**
- `TabHeader`: Primary header with notification/help actions, defaults to functional navigation
- `StackHeader`: Secondary header for detail pages, includes back navigation
- `Header` wrapper: Provides ScrollView layout for content pages, passes through TabHeader props

**Navigation Utilities:**
- `navigateWithReset()`: Uses router.replace() to avoid history accumulation
- `safeGoBack()`: Safe back navigation with fallback routes
- All navigation functions located in `utils/navigation.ts`

## Advanced Multi-Context Architecture

**Context Provider Hierarchy:**
- `AuthProvider` (root level): Authentication state and user management
- `AdminContext`: Multi-society management with role-based access control (RBAC)
- `AnalyticsContext`: Performance tracking and audit system
- `GovernanceContext`: Voting, policies, and emergency management
- `SocietyContext`: Society-specific data and settings

**Context Usage Patterns:**
- Settings pages use direct AsyncStorage instead of contexts for simplicity
- Main feature pages leverage contexts for complex state management
- Admin features use permission gates with RBAC integration

## File Upload and Storage Architecture

**File Operations:**
- `expo-document-picker`: Document selection from device
- `expo-file-system`: File system operations and caching
- `expo-sharing`: Native sharing capabilities
- Real file operations implemented in document management features

**Storage Patterns:**
- AsyncStorage for user preferences and auth tokens
- File system caching for downloaded documents
- API service handles file uploads with progress tracking

## Icon and Animation System

**LucideIcons Integration:**
- Custom mapping system in `LucideIcons.tsx` for comprehensive icon support
- Consistent icon sizing and color theming across app
- Fallback handling for unmapped icons

**Animation Architecture:**
- Native driver optimization where possible (transform animations)
- Non-native driver for layout/shadow animations to prevent conflicts
- Consistent animation timing and easing across components

## Development Best Practices

- Use custom alert component when using alerts
- Always run npm test and npm run lint before committing code
- TabHeader provides functional defaults - avoid overriding unless necessary
- Use StackHeader for detail pages, TabHeader for main sections
- Test file operations on physical devices for accurate behavior
- Prefer direct AsyncStorage over contexts in settings pages
- Check `issues.md` for known technical debt and current status