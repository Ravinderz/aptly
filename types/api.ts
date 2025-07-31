// API related type definitions

// Base API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  statusCode?: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAPIResponse<T> extends APIResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Authentication types
export interface LoginRequest {
  phoneNumber: string;
  countryCode: string;
}

export interface LoginResponse {
  sessionId: string;
  otpSent: boolean;
  expiresAt: string;
}

export interface OTPVerificationRequest {
  sessionId: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: 'Bearer';
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  avatar?: string;
  societyCode?: string;
  flatNumber?: string;
  role: 'resident' | 'admin' | 'security' | 'maintenance';
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

// Society types
export interface Society {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalFlats: number;
  amenities: string[];
  rules: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  managementCompany?: string;
  registrationDate: string;
}

export interface SocietyJoinRequest {
  societyCode: string;
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  moveInDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Visitor management types
export interface VisitorCreateRequest {
  name: string;
  phoneNumber: string;
  purpose: string;
  expectedDuration: number; // minutes
  hostFlatNumber?: string;
  vehicleNumber?: string;
  photo?: string;
  identityDocument?: {
    type: 'aadhar' | 'pan' | 'driving_license' | 'passport';
    number: string;
    photo: string;
  };
}

export interface Visitor {
  id: string;
  name: string;
  phoneNumber: string;
  purpose: string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'checked_in'
    | 'checked_out'
    | 'expired';
  hostFlatNumber: string;
  hostName: string;
  expectedDuration: number;
  actualDuration?: number;
  vehicleNumber?: string;
  photo?: string;
  identityDocument?: {
    type: string;
    number: string;
    photo: string;
  };
  qrCode?: string;
  approvedBy?: string;
  rejectionReason?: string;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  expiresAt: string;
}

// Community types
export interface PostCreateRequest {
  content: string;
  images?: string[];
  mentions?: string[];
  isAnonymous?: boolean;
}

export interface PostUpdateRequest {
  content?: string;
  images?: string[];
  mentions?: string[];
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
  mentions?: string[];
  parentCommentId?: string;
}

export interface PostInteractionRequest {
  postId: string;
  action: 'like' | 'unlike';
}

export interface CommentInteractionRequest {
  commentId: string;
  action: 'like' | 'unlike';
}

// Maintenance types
export interface MaintenanceRequestCreateRequest {
  title: string;
  description: string;
  category:
    | 'plumbing'
    | 'electrical'
    | 'civil'
    | 'appliance'
    | 'painting'
    | 'cleaning'
    | 'other';
  priority: 'low' | 'medium' | 'high';
  type: 'individual' | 'common_area';
  flatNumber?: string;
  images?: string[];
  preferredTimeSlot?: {
    start: string;
    end: string;
  };
}

export interface MaintenanceRequestUpdateRequest {
  status?: 'approved' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  completionImages?: string[];
}

// Notice types
export interface NoticeCreateRequest {
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'billing' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  attachments?: string[];
  targetAudience?: {
    allResidents?: boolean;
    specificFlats?: string[];
    roles?: string[];
  };
}

export interface NoticeUpdateRequest {
  title?: string;
  content?: string;
  category?: string;
  priority?: string;
  expiresAt?: string;
  attachments?: string[];
}

// Billing types
export interface BillGenerateRequest {
  flatNumbers: string[];
  billType: 'maintenance' | 'parking' | 'amenity' | 'penalty' | 'other';
  month: string; // YYYY-MM
  dueDate: string;
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    category: string;
  }[];
  discountAmount?: number;
  lateFeeRules?: {
    enabled: boolean;
    gracePeriodinDays: number;
    feeAmount: number;
    feeType: 'fixed' | 'percentage';
  };
}

export interface BillPaymentRequest {
  billId: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cash' | 'cheque';
  transactionReference?: string;
  notes?: string;
}

// File upload types
export interface FileUploadRequest {
  file: File | Blob;
  type:
    | 'avatar'
    | 'document'
    | 'post_image'
    | 'maintenance_image'
    | 'notice_attachment';
  metadata?: {
    originalName?: string;
    description?: string;
  };
}

export interface FileUploadResponse {
  id: string;
  url: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  expiresAt?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  type?: 'posts' | 'users' | 'notices' | 'maintenance' | 'all';
  filters?: {
    category?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    author?: string;
    status?: string;
  };
  pagination?: PaginationParams;
}

export interface SearchResult {
  type: 'post' | 'user' | 'notice' | 'maintenance';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  metadata: any;
  relevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

// Analytics types
export interface AnalyticsRequest {
  metric: 'posts' | 'visitors' | 'maintenance' | 'bills' | 'notices';
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: any;
}

export interface AnalyticsResponse {
  data: AnalyticsDataPoint[];
  summary: {
    total: number;
    average: number;
    growth: number; // percentage
    comparisonPeriod: string;
  };
  breakdown?: { [key: string]: number };
}

// Notification types
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  categories: {
    posts: boolean;
    comments: boolean;
    mentions: boolean;
    visitors: boolean;
    maintenance: boolean;
    bills: boolean;
    notices: boolean;
    emergencies: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  appVersion: string;
}

// WebSocket types
export interface WebSocketMessage {
  type:
    | 'notification'
    | 'visitor_update'
    | 'post_update'
    | 'maintenance_update'
    | 'bill_update';
  payload: any;
  timestamp: string;
  userId?: string;
  societyId?: string;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// Health check types
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'down';
    cache: 'ok' | 'down';
    storage: 'ok' | 'down';
    notifications: 'ok' | 'down';
  };
  responseTime: number;
}

// Error handling types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface APIErrorResponse extends APIResponse {
  success: false;
  error: APIError;
  validationErrors?: ValidationError[];
}
