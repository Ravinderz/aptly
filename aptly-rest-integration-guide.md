# Aptly App - REST Backend Integration Implementation Guide

## 🎯 **Overview**
This implementation guide provides a comprehensive approach to integrate your Aptly React Native Expo app with the REST backend using Zustand for state management. The solution follows the KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) principles while maintaining security best practices.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│  Zustand Store   │───▶│  API Services   │
│                 │    │                  │    │                 │
│ - Auth Screens  │    │ - Auth State     │    │ - HTTP Client   │
│ - Home Screen   │    │ - Visitors State │    │ - Auth Service  │
│ - Visitors      │    │ - Home State     │    │ - API Endpoints │
│ - UI Components │    │ - Persistence    │    │ - Error Handler │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 **Project Structure**

```
src/
├── api/
│   ├── client.ts              # HTTP client configuration
│   ├── endpoints.ts           # API endpoint definitions
│   └── services/              # Service functions
│       ├── auth.service.ts
│       ├── home.service.ts
│       └── visitors.service.ts
├── store/
│   ├── index.ts              # Combined store
│   └── slices/               # Feature stores
│       ├── auth.slice.ts
│       ├── home.slice.ts
│       └── visitors.slice.ts
├── types/
│   ├── api.types.ts          # API response types
│   ├── auth.types.ts         # Auth types
│   ├── home.types.ts         # Home types
│   └── visitors.types.ts     # Visitors types
├── utils/
│   ├── constants.ts          # App constants
│   ├── storage.ts            # MMKV storage setup
│   └── validation.ts         # Form validation
└── hooks/
    └── useApiError.ts        # Error handling hook
```

## 🛠️ **Implementation Steps**

### **Step 1: Install Dependencies**

```bash
# Core dependencies
npm install axios react-native-mmkv
npm install @react-native-async-storage/async-storage

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# Phone number formatting
npm install libphonenumber-js

# Development dependencies
npm install --save-dev @types/node
```

### **Step 2: Environment Configuration**

Create `.env` file:
```env
API_BASE_URL=https://api.aptly.app/v4
API_TIMEOUT=10000
ENCRYPTION_KEY=your-secure-encryption-key-here
```

### **Step 3: Types Definition** (`src/types/api.types.ts`)

```typescript
// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}
```

### **Step 4: MMKV Storage Setup** (`src/utils/storage.ts`)

```typescript
import { StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'aptly-app-storage',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-key',
});

export const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

// Utility functions for secure storage
export const secureStorage = {
  setSecureItem: (key: string, value: string) => storage.set(`secure_${key}`, value),
  getSecureItem: (key: string) => storage.getString(`secure_${key}`) ?? null,
  removeSecureItem: (key: string) => storage.delete(`secure_${key}`),
  clearAll: () => storage.clearAll(),
};
```

### **Step 5: HTTP Client Setup** (`src/api/client.ts`)

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/slices/auth.slice';
import { secureStorage } from '../utils/storage';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.aptly.app/v4';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add society code
    const societyCode = useAuthStore.getState().user?.societyCode;
    if (societyCode) {
      config.headers['X-Society-Code'] = societyCode;
    }

    // Add device ID
    const deviceId = secureStorage.getSecureItem('deviceId');
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = secureStorage.getSecureItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Update tokens in store and storage
          useAuthStore.getState().updateTokens(accessToken, newRefreshToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### **Step 6: API Endpoints Configuration** (`src/api/endpoints.ts`)

```typescript
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    CREATE_PROFILE: '/auth/profile',
    GET_PROFILE: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ASSOCIATE_SOCIETY: '/auth/associate-society',
  },

  // Home Dashboard
  HOME: {
    NOTICES: '/notices',
    SOCIETY_OVERVIEW: '/society/overview',
    QUICK_ACTIONS: '/quick-actions',
    DASHBOARD_DATA: '/dashboard/home',
    BILLING_SUMMARY: '/billing/summary',
  },

  // Visitors Management
  VISITORS: {
    LIST: '/visitors',
    UPCOMING: '/visitors/upcoming',
    CREATE: '/visitors',
    UPDATE_STATUS: (id: string) => `/visitors/${id}/status`,
    RESCHEDULE: (id: string) => `/visitors/${id}/reschedule`,
    QR_CODE: (id: string) => `/visitors/${id}/qr`,
    CHECKIN: (id: string) => `/visitors/${id}/checkin`,
    CHECKOUT: (id: string) => `/visitors/${id}/checkout`,
    DELETE: (id: string) => `/visitors/${id}`,
    STATS: '/visitors/stats',
  },
} as const;
```

### **Step 7: Auth Types** (`src/types/auth.types.ts`)

```typescript
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  familySize: number;
  emergencyContact: string;
  role: 'resident' | 'admin' | 'security';
  societyId: string;
  societyCode: string;
  isVerified: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: 'Bearer';
}

export interface RegisterRequest {
  phoneNumber: string;
  societyCode: string;
}

export interface VerifyOTPRequest {
  sessionId: string;
  otp: string;
}

export interface CreateProfileRequest {
  fullName: string;
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  familySize: number;
  emergencyContact: string;
  societyId: string;
  moveInDate: string;
}
```

### **Step 8: Auth Service** (`src/api/services/auth.service.ts`)

```typescript
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  RegisterRequest,
  VerifyOTPRequest,
  CreateProfileRequest,
  User,
  AuthTokens,
} from '../../types/auth.types';
import type { ApiResponse } from '../../types/api.types';

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<{
    message: string;
    sessionId: string;
    expiresAt: string;
  }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse<AuthTokens & {
    requiresProfileSetup: boolean;
  }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    return response.data;
  },

  createProfile: async (data: CreateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CREATE_PROFILE, data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.GET_PROFILE);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
};
```

### **Step 9: Auth Store** (`src/store/slices/auth.slice.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, secureStorage } from '../../utils/storage';
import { authService } from '../../api/services/auth.service';
import type { User } from '../../types/auth.types';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  requiresProfileSetup: boolean;

  // Actions
  register: (phoneNumber: string, societyCode: string) => Promise<void>;
  verifyOTP: (sessionId: string, otp: string) => Promise<void>;
  createProfile: (profileData: any) => Promise<void>;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionId: null,
      requiresProfileSetup: false,

      // Actions
      register: async (phoneNumber: string, societyCode: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register({ phoneNumber, societyCode });
          
          set({
            sessionId: response.data.sessionId,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      verifyOTP: async (sessionId: string, otp: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.verifyOTP({ sessionId, otp });
          
          const { accessToken, refreshToken, requiresProfileSetup } = response.data;
          
          // Store tokens securely
          secureStorage.setSecureItem('accessToken', accessToken);
          secureStorage.setSecureItem('refreshToken', refreshToken);
          
          set({
            accessToken,
            refreshToken,
            requiresProfileSetup,
            isAuthenticated: !requiresProfileSetup,
            isLoading: false,
            sessionId: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'OTP verification failed',
            isLoading: false,
          });
          throw error;
        }
      },

      createProfile: async (profileData: any) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.createProfile(profileData);
          
          set({
            user: response.data,
            requiresProfileSetup: false,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Profile creation failed',
            isLoading: false,
          });
          throw error;
        }
      },

      login: (accessToken: string, refreshToken: string, user: User) => {
        secureStorage.setSecureItem('accessToken', accessToken);
        secureStorage.setSecureItem('refreshToken', refreshToken);
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          requiresProfileSetup: false,
        });
      },

      logout: () => {
        // Clear secure storage
        secureStorage.clearAll();
        
        // Clear API call
        authService.logout().catch(() => {
          // Ignore errors on logout
        });
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          requiresProfileSetup: false,
          error: null,
          sessionId: null,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        secureStorage.setSecureItem('accessToken', accessToken);
        secureStorage.setSecureItem('refreshToken', refreshToken);
        
        set({ accessToken, refreshToken });
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true });
          const response = await authService.getCurrentUser();
          
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Failed to get user',
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        requiresProfileSetup: state.requiresProfileSetup,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore tokens from secure storage
        if (state?.isAuthenticated) {
          const accessToken = secureStorage.getSecureItem('accessToken');
          const refreshToken = secureStorage.getSecureItem('refreshToken');
          
          if (accessToken && refreshToken) {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
          } else {
            // Tokens missing - logout user
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      },
    }
  )
);
```

### **Step 10: Visitors Types & Service** (`src/types/visitors.types.ts`)

```typescript
export interface Visitor {
  id: string;
  name: string;
  phoneNumber: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'completed';
  category: 'Personal' | 'Delivery' | 'Service' | 'Official';
  date: string;
  time: string;
  timeFormat: string;
  hostFlatNumber: string;
  hostName: string;
  vehicleNumber?: string;
  expectedDuration: number;
  qrCode?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface CreateVisitorRequest {
  name: string;
  phoneNumber: string;
  purpose: string;
  category: 'Personal' | 'Delivery' | 'Service' | 'Official';
  date: string;
  time: string;
  expectedDuration: number;
  vehicleNumber?: string;
  hostFlatNumber: string;
  identityDocument?: {
    type: string;
    number: string;
  };
  isPreApproved?: boolean;
}

export interface VisitorFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  date?: string;
  search?: string;
}
```

### **Step 11: Visitors Service** (`src/api/services/visitors.service.ts`)

```typescript
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  Visitor,
  CreateVisitorRequest,
  VisitorFilters,
} from '../../types/visitors.types';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';

export const visitorsService = {
  getVisitors: async (filters: VisitorFilters = {}): Promise<PaginatedResponse<Visitor>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const response = await apiClient.get(`${API_ENDPOINTS.VISITORS.LIST}?${params}`);
    return response.data;
  },

  getUpcomingVisitors: async (limit = 5): Promise<ApiResponse<Visitor[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.VISITORS.UPCOMING}?limit=${limit}`);
    return response.data;
  },

  createVisitor: async (data: CreateVisitorRequest): Promise<ApiResponse<Visitor>> => {
    const response = await apiClient.post(API_ENDPOINTS.VISITORS.CREATE, data);
    return response.data;
  },

  updateVisitorStatus: async (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(API_ENDPOINTS.VISITORS.UPDATE_STATUS(id), {
      status,
      rejectionReason,
    });
    return response.data;
  },

  rescheduleVisitor: async (
    id: string,
    date: string,
    time: string,
    reason: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(API_ENDPOINTS.VISITORS.RESCHEDULE(id), {
      date,
      time,
      reason,
    });
    return response.data;
  },

  deleteVisitor: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(API_ENDPOINTS.VISITORS.DELETE(id));
    return response.data;
  },
};
```

### **Step 12: Visitors Store** (`src/store/slices/visitors.slice.ts`)

```typescript
import { create } from 'zustand';
import { visitorsService } from '../../api/services/visitors.service';
import type { Visitor, VisitorFilters, CreateVisitorRequest } from '../../types/visitors.types';
import type { PaginationMeta } from '../../types/api.types';

interface VisitorsState {
  // State
  visitors: Visitor[];
  upcomingVisitors: Visitor[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  filters: VisitorFilters;

  // Actions
  fetchVisitors: (filters?: VisitorFilters) => Promise<void>;
  fetchUpcomingVisitors: () => Promise<void>;
  createVisitor: (data: CreateVisitorRequest) => Promise<void>;
  updateVisitorStatus: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  rescheduleVisitor: (id: string, date: string, time: string, reason: string) => Promise<void>;
  deleteVisitor: (id: string) => Promise<void>;
  setFilters: (filters: VisitorFilters) => void;
  clearError: () => void;
}

export const useVisitorsStore = create<VisitorsState>((set, get) => ({
  // Initial state
  visitors: [],
  upcomingVisitors: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: { page: 1, limit: 20 },

  // Actions
  fetchVisitors: async (filters?: VisitorFilters) => {
    try {
      set({ isLoading: true, error: null });
      const finalFilters = { ...get().filters, ...filters };
      
      const response = await visitorsService.getVisitors(finalFilters);
      
      set({
        visitors: response.data,
        pagination: response.pagination,
        filters: finalFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch visitors',
        isLoading: false,
      });
    }
  },

  fetchUpcomingVisitors: async () => {
    try {
      const response = await visitorsService.getUpcomingVisitors();
      set({ upcomingVisitors: response.data });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch upcoming visitors',
      });
    }
  },

  createVisitor: async (data: CreateVisitorRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await visitorsService.createVisitor(data);
      
      // Add new visitor to the list
      set((state) => ({
        visitors: [response.data, ...state.visitors],
        isLoading: false,
      }));
      
      // Refresh upcoming visitors
      get().fetchUpcomingVisitors();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to create visitor',
        isLoading: false,
      });
      throw error;
    }
  },

  updateVisitorStatus: async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await visitorsService.updateVisitorStatus(id, status, reason);
      
      // Update visitor in the list
      set((state) => ({
        visitors: state.visitors.map((visitor) =>
          visitor.id === id ? { ...visitor, status } : visitor
        ),
      }));
      
      // Refresh upcoming visitors
      get().fetchUpcomingVisitors();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to update visitor status',
      });
      throw error;
    }
  },

  rescheduleVisitor: async (id: string, date: string, time: string, reason: string) => {
    try {
      await visitorsService.rescheduleVisitor(id, date, time, reason);
      
      // Update visitor in the list
      set((state) => ({
        visitors: state.visitors.map((visitor) =>
          visitor.id === id ? { ...visitor, date, time } : visitor
        ),
      }));
      
      // Refresh upcoming visitors
      get().fetchUpcomingVisitors();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to reschedule visitor',
      });
      throw error;
    }
  },

  deleteVisitor: async (id: string) => {
    try {
      await visitorsService.deleteVisitor(id);
      
      // Remove visitor from the list
      set((state) => ({
        visitors: state.visitors.filter((visitor) => visitor.id !== id),
        upcomingVisitors: state.upcomingVisitors.filter((visitor) => visitor.id !== id),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to delete visitor',
      });
      throw error;
    }
  },

  setFilters: (filters: VisitorFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => set({ error: null }),
}));
```

### **Step 13: Combined Store** (`src/store/index.ts`)

```typescript
// Re-export all stores for easy importing
export { useAuthStore } from './slices/auth.slice';
export { useVisitorsStore } from './slices/visitors.slice';

// You can add more stores here as needed
// export { useHomeStore } from './slices/home.slice';
// export { useNotificationsStore } from './slices/notifications.slice';
```

### **Step 14: Error Handling Hook** (`src/hooks/useApiError.ts`)

```typescript
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface ApiError {
  response?: {
    data?: {
      error?: {
        message: string;
        code: string;
        details?: any;
      };
    };
    status: number;
  };
  message: string;
}

export const useApiError = () => {
  const handleError = useCallback((error: ApiError, customMessage?: string) => {
    const errorMessage = 
      customMessage || 
      error.response?.data?.error?.message || 
      error.message || 
      'Something went wrong';

    const errorCode = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    
    console.error(`API Error [${errorCode}]:`, errorMessage);
    
    // Show user-friendly error message
    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleNetworkError = useCallback(() => {
    Alert.alert(
      'Network Error',
      'Please check your internet connection and try again.',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  return { handleError, handleNetworkError };
};
```

### **Step 15: Usage Examples**

#### **Authentication Flow:**

```typescript
// In your Login component
import { useAuthStore } from '../store';
import { useApiError } from '../hooks/useApiError';

const LoginScreen = () => {
  const { register, verifyOTP, isLoading, error } = useAuthStore();
  const { handleError } = useApiError();

  const handleRegister = async (phoneNumber: string, societyCode: string) => {
    try {
      await register(phoneNumber, societyCode);
      // Navigate to OTP verification
    } catch (error) {
      handleError(error, 'Registration failed');
    }
  };

  const handleOTPVerification = async (otp: string) => {
    try {
      await verifyOTP(sessionId, otp);
      // Navigate based on requiresProfileSetup
    } catch (error) {
      handleError(error, 'OTP verification failed');
    }
  };

  // Component JSX...
};
```

#### **Visitors Management:**

```typescript
// In your Visitors component
import { useVisitorsStore } from '../store';

const VisitorsScreen = () => {
  const {
    visitors,
    upcomingVisitors,
    isLoading,
    fetchVisitors,
    createVisitor,
    updateVisitorStatus,
  } = useVisitorsStore();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCreateVisitor = async (visitorData) => {
    try {
      await createVisitor(visitorData);
      // Show success message
    } catch (error) {
      // Error handled in store
    }
  };

  const handleApproveVisitor = async (visitorId: string) => {
    try {