# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aptly is a React Native mobile app built with Expo for housing society management in India. The app targets societies under 100 units and focuses on GST-compliant billing, maintenance management, visitor management, community features, and vendor management.

**Tech Stack:**
- React Native with Expo SDK 53
- TypeScript with strict mode
- NativeWind (Tailwind CSS for React Native)
- Expo Router for file-based routing
- React Hook Form for form handling
- Axios for API communication
- AsyncStorage for local data persistence

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

# Linting
npm run lint
# or
expo lint

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
- All API calls use the centralized `APIService` class
- Automatic retry logic with exponential backoff
- Token refresh handled automatically
- Network state awareness with offline queueing

**Design System:**
- Use existing UI components in `components/ui/`
- Follow the established color palette and typography
- Maintain consistency with NativeWind classes
- Prefer composition over prop drilling for component variants

**Testing:**
- No test framework currently configured
- Manual testing on iOS/Android simulators via Expo

**Code Quality:**
- TypeScript strict mode enabled
- ESLint with Expo config
- Path aliases configured: `@/*` maps to project root