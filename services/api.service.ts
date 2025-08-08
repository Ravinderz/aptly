/**
 * API Service Layer
 * Centralized API service with robust error handling, caching, and retry mechanisms
 */

import { apiClient, APIClientError } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  APIResponse,
  PaginatedResponse,
  CacheConfig,
  LoadingState,
  APIError,
} from '@/types/api';
import { Post, Comment, CreatePostRequest, CreateCommentRequest, User } from '@/types/community';
import { Visitor, VisitorRequest } from '@/types/security';
import { Notice } from '@/types/notifications';
import { Bill, Payment } from '@/types/billing';

/**
 * In-memory cache for API responses
 */
class APICache {
  private cache = new Map<string, { data: any; expiry: number; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry, timestamp: Date.now() });
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getSize(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Loading state management
 */
class LoadingManager {
  private loadingStates = new Map<string, boolean>();
  private listeners = new Set<(states: Record<string, boolean>) => void>();

  setLoading(key: string, loading: boolean): void {
    if (loading) {
      this.loadingStates.set(key, true);
    } else {
      this.loadingStates.delete(key);
    }
    this.notifyListeners();
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  getStates(): Record<string, boolean> {
    return Object.fromEntries(this.loadingStates);
  }

  subscribe(listener: (states: Record<string, boolean>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const states = this.getStates();
    this.listeners.forEach(listener => listener(states));
  }
}

/**
 * Main API Service Class
 */
class APIService {
  private cache = new APICache();
  private loadingManager = new LoadingManager();

  constructor() {
    // Cleanup expired cache entries every 5 minutes
    setInterval(() => this.cache.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Execute API call with loading state management, caching, and error handling
   */
  private async executeRequest<T>(
    key: string,
    request: () => Promise<APIResponse<T>>,
    config?: CacheConfig & { loadingKey?: string }
  ): Promise<T> {
    const loadingKey = config?.loadingKey || key;
    
    try {
      // Check cache first
      if (config?.useCache !== false) {
        const cached = this.cache.get<T>(key);
        if (cached) {
          return cached;
        }
      }

      // Set loading state
      this.loadingManager.setLoading(loadingKey, true);

      // Execute request
      const response = await request();

      // Cache successful response
      if (config?.useCache !== false && response.success) {
        this.cache.set(key, response.data, config?.cacheTTL);
      }

      return response.data;
    } catch (error) {
      console.error(`API Error [${key}]:`, error);
      throw this.handleError(error);
    } finally {
      this.loadingManager.setLoading(loadingKey, false);
    }
  }

  /**
   * Handle API errors with proper type conversion
   */
  private handleError(error: unknown): APIError {
    if (error instanceof APIClientError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    };
  }

  /**
   * Get loading state manager
   */
  getLoadingManager(): LoadingManager {
    return this.loadingManager;
  }

  /**
   * Invalidate cache
   */
  invalidateCache(pattern?: string): void {
    this.cache.invalidate(pattern);
  }

  // AUTH API METHODS
  async login(phone: string): Promise<{ success: boolean; message: string }> {
    return this.executeRequest(
      `auth.login.${phone}`,
      () => apiClient.post(API_ENDPOINTS.AUTH.PHONE_REGISTER, { phone }),
      { useCache: false }
    );
  }

  async verifyOTP(phone: string, otp: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    return this.executeRequest(
      `auth.verify.${phone}.${otp}`,
      () => apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp }),
      { useCache: false }
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.executeRequest(
      'auth.current-user',
      () => apiClient.get(API_ENDPOINTS.AUTH.ME),
      { cacheTTL: 10 * 60 * 1000 } // 10 minutes
    );
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const result = await this.executeRequest(
      'auth.update-profile',
      () => apiClient.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, updates),
      { useCache: false }
    );
    
    // Invalidate user cache
    this.cache.invalidate('auth.current-user');
    
    return result;
  }

  async logout(): Promise<void> {
    await this.executeRequest(
      'auth.logout',
      () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
      { useCache: false }
    );
    
    // Clear all cache on logout
    this.cache.invalidate();
  }

  // COMMUNITY API METHODS
  async getCommunityPosts(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Post>> {
    return this.executeRequest(
      `community.posts.${page}.${limit}`,
      () => apiClient.get(`${API_ENDPOINTS.COMMUNITY.POSTS}?page=${page}&limit=${limit}`),
      { cacheTTL: 2 * 60 * 1000 } // 2 minutes
    );
  }

  async createPost(request: CreatePostRequest): Promise<Post> {
    const result = await this.executeRequest(
      'community.create-post',
      () => apiClient.post(API_ENDPOINTS.COMMUNITY.POSTS, request),
      { useCache: false }
    );

    // Invalidate posts cache
    this.cache.invalidate('community.posts');
    
    return result;
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    return this.executeRequest(
      `community.comments.${postId}`,
      () => apiClient.get(API_ENDPOINTS.COMMUNITY.COMMENTS(postId)),
      { cacheTTL: 1 * 60 * 1000 } // 1 minute
    );
  }

  async addComment(request: CreateCommentRequest): Promise<Comment> {
    const result = await this.executeRequest(
      'community.add-comment',
      () => apiClient.post(API_ENDPOINTS.COMMUNITY.COMMENTS(request.postId), request),
      { useCache: false }
    );

    // Invalidate comments cache for this post
    this.cache.invalidate(`community.comments.${request.postId}`);
    
    return result;
  }

  async togglePostLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const result = await this.executeRequest(
      `community.toggle-like.${postId}`,
      () => apiClient.post(API_ENDPOINTS.COMMUNITY.LIKE_POST(postId)),
      { useCache: false }
    );

    // Invalidate posts cache
    this.cache.invalidate('community.posts');
    
    return result;
  }

  async deletePost(postId: string): Promise<void> {
    await this.executeRequest(
      `community.delete-post.${postId}`,
      () => apiClient.delete(API_ENDPOINTS.COMMUNITY.POST(postId)),
      { useCache: false }
    );

    // Invalidate posts cache
    this.cache.invalidate('community.posts');
  }

  // VISITOR API METHODS
  async getVisitors(status?: 'pending' | 'approved' | 'checked-in' | 'checked-out'): Promise<Visitor[]> {
    const query = status ? `?status=${status}` : '';
    return this.executeRequest(
      `visitors.list${query}`,
      () => apiClient.get(`${API_ENDPOINTS.VISITORS.LIST}${query}`),
      { cacheTTL: 30 * 1000 } // 30 seconds for real-time data
    );
  }

  async createVisitor(request: VisitorRequest): Promise<Visitor> {
    const result = await this.executeRequest(
      'visitors.create',
      () => apiClient.post(API_ENDPOINTS.VISITORS.CREATE, request),
      { useCache: false }
    );

    // Invalidate visitors cache
    this.cache.invalidate('visitors.list');
    
    return result;
  }

  async approveVisitor(visitorId: string): Promise<Visitor> {
    const result = await this.executeRequest(
      `visitors.approve.${visitorId}`,
      () => apiClient.post(API_ENDPOINTS.VISITORS.APPROVE(visitorId)),
      { useCache: false }
    );

    // Invalidate visitors cache
    this.cache.invalidate('visitors.list');
    
    return result;
  }

  async checkInVisitor(visitorId: string): Promise<Visitor> {
    const result = await this.executeRequest(
      `visitors.checkin.${visitorId}`,
      () => apiClient.post(API_ENDPOINTS.VISITORS.CHECK_IN(visitorId)),
      { useCache: false }
    );

    // Invalidate visitors cache
    this.cache.invalidate('visitors.list');
    
    return result;
  }

  async checkOutVisitor(visitorId: string): Promise<Visitor> {
    const result = await this.executeRequest(
      `visitors.checkout.${visitorId}`,
      () => apiClient.post(API_ENDPOINTS.VISITORS.CHECK_OUT(visitorId)),
      { useCache: false }
    );

    // Invalidate visitors cache
    this.cache.invalidate('visitors.list');
    
    return result;
  }

  // NOTICES API METHODS
  async getNotices(): Promise<Notice[]> {
    return this.executeRequest(
      'notices.list',
      () => apiClient.get(API_ENDPOINTS.NOTICES.LIST),
      { cacheTTL: 5 * 60 * 1000 } // 5 minutes
    );
  }

  async createNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notice> {
    const result = await this.executeRequest(
      'notices.create',
      () => apiClient.post(API_ENDPOINTS.NOTICES.CREATE, notice),
      { useCache: false }
    );

    // Invalidate notices cache
    this.cache.invalidate('notices.list');
    
    return result;
  }

  // BILLING API METHODS
  async getBills(): Promise<Bill[]> {
    return this.executeRequest(
      'billing.bills',
      () => apiClient.get(API_ENDPOINTS.BILLING.BILLS),
      { cacheTTL: 10 * 60 * 1000 } // 10 minutes
    );
  }

  async getBill(billId: string): Promise<Bill> {
    return this.executeRequest(
      `billing.bill.${billId}`,
      () => apiClient.get(API_ENDPOINTS.BILLING.BILL(billId)),
      { cacheTTL: 5 * 60 * 1000 } // 5 minutes
    );
  }

  async payBill(billId: string, paymentData: any): Promise<Payment> {
    const result = await this.executeRequest(
      `billing.pay.${billId}`,
      () => apiClient.post(API_ENDPOINTS.BILLING.PAYMENT(billId), paymentData),
      { useCache: false }
    );

    // Invalidate billing cache
    this.cache.invalidate('billing');
    
    return result;
  }

  // ANALYTICS API METHODS
  async getDashboardAnalytics(): Promise<any> {
    return this.executeRequest(
      'analytics.dashboard',
      () => apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD),
      { cacheTTL: 15 * 60 * 1000 } // 15 minutes
    );
  }

  async getResidentAnalytics(): Promise<any> {
    return this.executeRequest(
      'analytics.residents',
      () => apiClient.get(API_ENDPOINTS.ANALYTICS.RESIDENTS),
      { cacheTTL: 30 * 60 * 1000 } // 30 minutes
    );
  }

  // FILE UPLOAD METHODS
  async uploadFile(file: FormData, type: 'avatar' | 'document' | 'single' = 'single'): Promise<{ url: string; filename: string }> {
    const endpoint = type === 'avatar' ? API_ENDPOINTS.UPLOAD.AVATAR :
                    type === 'document' ? API_ENDPOINTS.UPLOAD.DOCUMENT :
                    API_ENDPOINTS.UPLOAD.SINGLE;

    return this.executeRequest(
      `upload.${type}.${Date.now()}`,
      () => apiClient.upload(endpoint, file),
      { useCache: false }
    );
  }

  // UTILITIES
  getCacheSize(): number {
    return this.cache.getSize();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.getSize(),
      keys: Array.from((this.cache as any).cache.keys()),
    };
  }
}

// Create and export singleton instance
export const apiService = new APIService();
export default apiService;