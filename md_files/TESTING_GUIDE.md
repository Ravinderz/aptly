# Testing Guide for Zustand Store Fixes

## Critical Error Scenarios to Test

### 1. AsyncStorage Unavailability
**How to Test:**
```bash
# Start the app and look for these console messages:
# ✅ "AsyncStorage is ready and functional" 
# OR
# ⚠️ "AsyncStorage not available, stores will run in memory-only mode"
```

**Expected Behavior:**
- No "Unable to update item" errors in console
- App starts successfully even if AsyncStorage fails
- Stores work in memory-only mode
- Feature flags and auth state work normally

### 2. Network Failures
**How to Test:**
```bash
# Turn off internet connection and start the app
# OR
# Use network throttling in dev tools
```

**Expected Behavior:**
- No "Network request failed" crashes
- Console shows: "⚠️ Network unavailable, using cached flags"
- App initializes with default/cached feature flags
- Remote config failures don't block app startup

### 3. getSnapshot Infinite Loop
**How to Test:**
```bash
# Start the app and check console for React warnings
# Look for absence of this warning:
# "The result of getSnapshot should be cached to avoid an infinite loop"
```

**Expected Behavior:**
- No infinite loop warnings
- StoreInitializer renders without flickering
- Store subscriptions are stable
- No excessive re-renders

### 4. Storage Corruption
**How to Test:**
```bash
# Manually corrupt AsyncStorage data:
AsyncStorage.setItem('feature-flags-storage', 'invalid-json{');
AsyncStorage.setItem('auth-storage', 'corrupted-data');
```

**Expected Behavior:**
- App recovers gracefully from corrupted data
- Console shows: "🔧 Attempting to recover corrupted storage"
- Stores reset to default state
- No app crashes

### 5. Store Initialization Robustness
**How to Test:**
```bash
# Monitor console during app startup for:
# 🚀 "Starting store initialization..."
# ✅ "Store initialization completed"
# 
# If errors occur:
# 🚨 "Attempting emergency fallback..."
# ✅ "Emergency fallback completed"
```

**Expected Behavior:**
- Stores initialize even with partial failures
- Error isolation - one store failure doesn't crash others
- Emergency recovery mechanisms activate when needed
- App remains functional with degraded features

## Console Messages Guide

### ✅ Success Messages
- `✅ AsyncStorage is ready and functional`
- `✅ Successfully rehydrated: feature-flags-storage`  
- `✅ Successfully rehydrated: auth-storage`
- `✅ Store initialization completed`
- `✅ Remote feature flags loaded successfully`

### ⚠️ Warning Messages (Expected in failure scenarios)
- `⚠️ AsyncStorage not available, stores will run in memory-only mode`
- `⚠️ Network unavailable, using cached flags`
- `⚠️ Auth initialization failed, app will work with guest mode`
- `⚠️ Remote config request timed out`
- `⚠️ Some features may be limited`

### 🚨 Recovery Messages
- `🚨 Attempting emergency fallback...`
- `🔧 Attempting to recover corrupted storage`
- `🧹 Emergency storage reset completed`

### ❌ Error Messages That Should NOT Appear
- `Unable to update item 'feature-flags-storage', the given storage is currently unavailable`
- `Unable to update item 'auth-storage', the given storage is currently unavailable`  
- `The result of getSnapshot should be cached to avoid an infinite loop`
- Any uncaught exceptions from store operations

## Testing Checklist

### Basic Functionality
- [ ] App starts without console errors
- [ ] Feature flags load and work correctly
- [ ] Authentication state persists across app restarts
- [ ] No infinite loop warnings in React DevTools

### Error Resilience  
- [ ] Works with airplane mode enabled
- [ ] Recovers from AsyncStorage being full/unavailable
- [ ] Handles corrupted storage data gracefully
- [ ] Network timeouts don't crash the app
- [ ] Store errors don't propagate to UI crashes

### Performance
- [ ] App startup time acceptable (< 3 seconds)
- [ ] No memory leaks from store subscriptions
- [ ] Smooth navigation with store state changes
- [ ] No excessive re-renders in React DevTools

### Development Tools
- [ ] Store monitoring logs appear in development
- [ ] Health checks run every minute in dev mode
- [ ] Store DevTools integration works properly
- [ ] Error aggregation and reporting functional

## Manual Recovery Testing

### Emergency Store Reset
```javascript
// In dev console or React DevTools:
import { useFeatureFlagStore, useAuthStore } from '@/stores';

// Reset individual stores
useFeatureFlagStore.getState().reset();
useAuthStore.getState().reset();

// Clear all storage
import { StorageRecovery } from '@/stores/utils/storageManager';
await StorageRecovery.emergencyReset();
```

### Health Monitoring
```javascript
// Check system health
import { getSystemHealthReport } from '@/stores/utils/storeMonitor';
const report = await getSystemHealthReport();
console.log(report);
```

## Expected Performance Benchmarks

### Startup Performance
- **Cold Start**: < 3 seconds to fully initialized
- **Storage Check**: < 100ms for availability detection
- **Store Hydration**: < 500ms per store
- **Network Timeout**: 5 seconds maximum wait

### Memory Usage
- **Memory Fallback**: Only activated when needed
- **Store State**: Minimal memory footprint
- **Cache Size**: Limited to prevent memory leaks

### Error Recovery
- **Storage Recovery**: < 1 second for corruption detection
- **Network Fallback**: Immediate fallback to cached data
- **Emergency Reset**: < 2 seconds for complete cleanup

## Success Criteria

The fixes are successful if:

1. **Zero Critical Errors**: No AsyncStorage, getSnapshot, or network errors
2. **Graceful Degradation**: App works offline and with storage issues
3. **Fast Recovery**: Quick recovery from error conditions
4. **Stable Performance**: No performance regressions
5. **Developer Experience**: Clear error messages and debugging tools

## If Issues Persist

1. **Check Console**: Look for specific error patterns
2. **Run Health Check**: Use monitoring tools to diagnose
3. **Clear Storage**: Use emergency reset procedures
4. **Review Logs**: Check store monitoring output
5. **File Bug Report**: Include health report and console logs

The mobile app should now be robust against all identified error scenarios while maintaining full functionality and performance.