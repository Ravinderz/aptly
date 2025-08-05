// Storage-related type definitions

export interface Vehicle {
  id: string;
  type: 'car' | 'bike' | 'bicycle' | 'other';
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  parkingSlot?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type:
    | 'aadhar'
    | 'pan'
    | 'passport'
    | 'driving_license'
    | 'property_papers'
    | 'other';
  description?: string;
  fileUri: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  security: {
    biometricEnabled: boolean;
    autoLock: boolean;
    autoLockTimeout: number; // minutes
  };
  privacy: {
    shareWithSociety: boolean;
    allowMentions: boolean;
    profileVisibility: 'public' | 'residents' | 'private';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'billing' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  author: string;
  publishedAt: string;
  expiresAt?: string;
  attachments?: string[];
  isRead: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  flatNumber: string;
  societyCode: string;
  societyId: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  mentions: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[];
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
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
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  type: 'individual' | 'common_area';
  flatNumber?: string;
  residentName: string;
  residentPhone: string;
  images?: string[];
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  assignedToPhone?: string;
  date: string;
  affectedResidents?: string[];
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Form types
export interface VehicleFormData {
  type: Vehicle['type'];
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  parkingSlot?: string;
  isPrimary: boolean;
}

export interface EmergencyContactFormData {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: string;
  isPrimary: boolean;
}

export interface DocumentFormData {
  name: string;
  type: Document['type'];
  description?: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Storage operation result types
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search and filter types
export interface SearchFilter {
  query?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'date' | 'name' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
