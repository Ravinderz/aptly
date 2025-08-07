# Deprecated Services

This folder contains services that have been deprecated and moved from the main services folder as part of a systematic cleanup following KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) principles.

## 🚫 Moved Services and Rationale

### **API Services**
- **`api.service.ts`** → **Replaced by** `../api.client.ts`
  - **Reason**: Duplicate functionality - both provided HTTP client capabilities
  - **Current Usage**: Use `apiClient` from `api.client.ts` (modern REST client with interceptors)
  - **Breaking Changes**: None - updated index.ts with compatibility layer

### **Authentication Services**
- **`auth.service.ts`** → **Replaced by** `../auth.service.rest.ts`
  - **Reason**: Duplicate functionality - both provided authentication services
  - **Current Usage**: Use `RestAuthService` from `auth.service.rest.ts` (modern REST-based auth)
  - **Breaking Changes**: None - index.ts exports RestAuthService as AuthService

### **Mock/Unused Services**
- **`billing.service.ts`** → **Deprecated**
  - **Reason**: Mock service with no real usage in codebase (only in exports)
  - **Usage**: Not used in any components or stores
  - **Future**: Implement real billing service when needed

- **`governance.service.ts`** → **Deprecated**
  - **Reason**: Mock service with no real usage in codebase (only in exports)
  - **Usage**: Not used in any components or stores
  - **Future**: Implement real governance service when needed

- **`maintenance.service.ts`** → **Deprecated**
  - **Reason**: Mock service with no real usage in codebase (only in exports)
  - **Usage**: Not used in any components or stores
  - **Future**: Implement real maintenance service when needed

- **`notification.service.ts`** → **Deprecated**
  - **Reason**: Mock service with minimal real usage (only in helper functions)
  - **Usage**: Limited usage in ServiceHelpers
  - **Future**: Implement real notification service when needed

### **Admin Services**
- **`admin/adminAuthService.ts`** → **Deprecated**
  - **Reason**: Already commented out in index.ts exports, likely unused
  - **Usage**: No active usage found in codebase
  - **Future**: Remove if not needed, or implement properly

## 🎯 Current Active Services

After cleanup, the main services folder now contains only actively used services:

- ✅ **`api.client.ts`** - Modern HTTP client with interceptors
- ✅ **`auth.service.rest.ts`** - REST-based authentication service
- ✅ **`visitors.service.rest.ts`** - REST-based visitor management
- ✅ **`communityApi.ts`** - Community features (actively used)
- ✅ **`biometric.service.ts`** - Biometric authentication (preserved as requested)
- ✅ **`admin/authService.ts`** - Admin authentication
- ✅ **`admin/roleManager.ts`** - Role-based access control

## 🔄 Migration Path

If you need to restore any of these services:

1. **Copy** the service file back to the main services folder
2. **Update** `services/index.ts` to include the exports
3. **Update** the `services` constant to include the service instance
4. **Test** thoroughly to ensure no breaking changes

## ⚠️ Important Notes

- **No Breaking Changes**: All exports are maintained through compatibility layers
- **Biometric Service**: Preserved as specifically requested
- **API Alignment**: Remaining services align with the documented API endpoints
- **KISS Principle**: Simplified service architecture by removing unused complexity
- **DRY Principle**: Eliminated duplicate functionality between services

## 🚀 Benefits of Cleanup

1. **Reduced Complexity**: Fewer services to maintain and understand
2. **Clear Architecture**: Active services directly support documented API endpoints
3. **Better Performance**: Fewer unused service imports and instances
4. **Maintainability**: Focus development effort on actually used services
5. **React Native Best Practices**: Cleaner service architecture following Expo patterns

---

*This cleanup was performed on $(date) following systematic analysis of service usage patterns and API endpoint documentation.*