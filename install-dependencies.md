# Missing Dependencies for Aptly Project

## Required Dependencies

Run the following commands to install the missing dependencies:

### Core Dependencies
```bash
# Image Picker for profile photos and document uploads
npx expo install expo-image-picker

# AsyncStorage for local data persistence
npx expo install @react-native-async-storage/async-storage

# Network detection
npx expo install @react-native-community/netinfo

# HTTP client for API calls
npm install axios

# Date/time utilities
npm install date-fns
```

### Authentication & Security Dependencies
```bash
# Expo SecureStore is already installed ✅
# expo-secure-store: ~14.2.3

# Local Authentication (biometric) is already installed ✅
# expo-local-authentication: ~16.0.5
```

### Additional Utility Dependencies
```bash
# Class name utility for conditional styling
npm install clsx

# React Native Vector Icons (if not using Lucide)
# npm install react-native-vector-icons
```

## Already Installed Dependencies ✅

The following required dependencies are already present:
- `expo-router` - Navigation
- `expo-secure-store` - Secure storage
- `expo-local-authentication` - Biometric auth
- `lucide-react-native` - Icons
- `nativewind` - Styling
- `react-native-safe-area-context` - Safe areas
- `expo-constants` - Device constants

## Installation Commands

Run all missing dependencies at once:

```bash
# Install all missing dependencies
npx expo install expo-image-picker @react-native-async-storage/async-storage @react-native-community/netinfo
npm install axios date-fns
```

## Post-Installation Steps

1. **Clear Metro cache** (if you encounter issues):
   ```bash
   npx expo start --clear
   ```

2. **Update Metro config** if needed for new dependencies

3. **Restart development server**:
   ```bash
   npx expo start
   ```

## Optional Dependencies (for future enhancements)

```bash
# If you want to add more features later:
npx expo install expo-camera           # Camera functionality
npx expo install expo-document-picker  # Document picking
npx expo install expo-file-system      # File system access
npx expo install expo-notifications    # Push notifications
npx expo install expo-location         # Location services
```

## Import Updates Needed

After installing dependencies, update these import statements in your files:

### AuthService (services/auth.service.ts)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
// This import is already correct ✅
```

### APIService (services/api.service.ts)
```typescript
import axios from 'axios';
import { AuthService } from './auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### Settings screens
```typescript
import * as ImagePicker from 'expo-image-picker';
// This import is already correct ✅
```

## Notes

- Most Expo packages are installed using `npx expo install` 
- Regular npm packages use `npm install`
- Some dependencies like `expo-secure-store` are already installed
- The project structure supports all the implemented features once dependencies are installed