/**
 * Society Management Types
 * Enhanced types for society onboarding, verification, and management
 */

// Base society information
export interface SocietyInfo {
  id: string;
  code: string;
  name: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  stats: {
    totalFlats: number;
    registeredResidents: number;
    occupancyRate: number;
  };
  amenities: string[];
  rules: string[];
  images?: string[];
  establishedYear?: number;
  managementCompany?: string;
  registrationStatus: 'verified' | 'pending' | 'unverified';
  createdAt: string;
  updatedAt: string;
}

// Society verification requests
export interface SocietyVerificationRequest {
  phoneNumber: string;
  societyCode?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocietyVerificationResponse {
  success: boolean;
  data?: {
    society: SocietyInfo;
    userAssociation?: UserSocietyAssociation;
    requiresOnboarding: boolean;
    existingResident: boolean;
  };
  error?: {
    code: 'SOCIETY_NOT_FOUND' | 'INVALID_CODE' | 'PHONE_NOT_ASSOCIATED' | 'NETWORK_ERROR';
    message: string;
    suggestions?: string[];
  };
}

// Society search and discovery
export interface SocietySearchRequest {
  query?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
  };
  filters?: {
    city?: string;
    state?: string;
    minFlats?: number;
    maxFlats?: number;
    amenities?: string[];
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SocietySearchResponse {
  success: boolean;
  data?: {
    societies: SocietyInfo[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

// User society association
export interface UserSocietyAssociation {
  id: string;
  userId: string;
  societyId: string;
  societyCode: string;
  flatNumber: string;
  block?: string;
  floor?: string;
  ownershipType: 'owner' | 'tenant' | 'family_member';
  occupancyStatus: 'current' | 'future' | 'past';
  moveInDate: string;
  moveOutDate?: string;
  isPrimary: boolean;
  status: 'active' | 'pending_approval' | 'rejected' | 'inactive';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Society join/onboarding requests
export interface SocietyJoinRequest {
  societyId: string;
  societyCode: string;
  userProfile: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    dateOfBirth?: string;
    photo?: string;
  };
  residenceDetails: {
    flatNumber: string;
    block?: string;
    floor?: string;
    ownershipType: 'owner' | 'tenant' | 'family_member';
    moveInDate: string;
    isPrimary: boolean;
  };
  emergencyContacts: EmergencyContactInfo[];
  documents?: {
    proofOfResidence?: FileUpload;
    identityProof?: FileUpload;
    ownershipProof?: FileUpload;
    agreementCopy?: FileUpload;
  };
  additionalInfo?: {
    vehicleDetails?: VehicleInfo[];
    familyMembers?: FamilyMemberInfo[];
    specialRequirements?: string;
    previousAddress?: string;
  };
  consentAgreements: {
    termsAndConditions: boolean;
    privacyPolicy: boolean;
    societyRules: boolean;
    dataSharing: boolean;
  };
}

export interface SocietyJoinResponse {
  success: boolean;
  data?: {
    requestId: string;
    association: UserSocietyAssociation;
    requiresApproval: boolean;
    approvalTimeframe?: string;
    nextSteps: string[];
  };
  error?: {
    code: string;
    message: string;
    validationErrors?: ValidationError[];
  };
}

// Supporting interfaces
export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

export interface VehicleInfo {
  type: 'car' | 'bike' | 'bicycle' | 'other';
  make: string;
  model: string;
  color: string;
  registrationNumber: string;
  parkingRequired: boolean;
  parkingType?: 'covered' | 'open' | 'none';
}

export interface FamilyMemberInfo {
  name: string;
  relationship: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
  isResident: boolean;
  photo?: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Society onboarding flow state
export interface SocietyOnboardingState {
  currentStep: 'verification' | 'search' | 'selection' | 'details' | 'profile' | 'review' | 'completion';
  selectedSociety: SocietyInfo | null;
  userAssociation: UserSocietyAssociation | null;
  onboardingData: Partial<SocietyJoinRequest>;
  errors: Record<string, string>;
  loading: boolean;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
  };
}

// Society onboarding analytics
export interface SocietyOnboardingAnalytics {
  sessionId: string;
  userId?: string;
  startedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  currentStep: string;
  completedSteps: string[];
  errors: Array<{
    step: string;
    error: string;
    timestamp: string;
  }>;
  userActions: Array<{
    action: string;
    step: string;
    data?: any;
    timestamp: string;
  }>;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    screenSize: string;
  };
}

// Society invitation system (future enhancement)
export interface SocietyInvitation {
  id: string;
  societyId: string;
  invitedBy: string;
  invitedPhone: string;
  invitedEmail?: string;
  message?: string;
  flatNumber: string;
  ownershipType: 'owner' | 'tenant' | 'family_member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  validUntil: string;
  createdAt: string;
  acceptedAt?: string;
}

// Society admin management types
export interface SocietyAdmin {
  id: string;
  userId: string;
  societyId: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'manager';
  permissions: SocietyPermission[];
  status: 'active' | 'inactive' | 'pending';
  assignedBy: string;
  assignedAt: string;
  revokedAt?: string;
  revokedBy?: string;
}

export interface SocietyPermission {
  id: string;
  name: string;
  description: string;
  category: 'user_management' | 'billing' | 'maintenance' | 'security' | 'governance' | 'analytics';
  level: 'read' | 'write' | 'admin';
}

// Multi-society support
export interface UserMultiSocietyProfile {
  userId: string;
  associations: UserSocietyAssociation[];
  defaultSocietyId: string;
  preferences: {
    autoSwitchSociety: boolean;
    notificationPreferences: Record<string, boolean>;
    dashboardLayout: 'unified' | 'per_society';
  };
}

// Society health and quality metrics
export interface SocietyHealthMetrics {
  societyId: string;
  overall: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    lastUpdated: string;
  };
  categories: {
    maintenance: { score: number; issues: string[] };
    security: { score: number; issues: string[] };
    community: { score: number; issues: string[] };
    finance: { score: number; issues: string[] };
    governance: { score: number; issues: string[] };
  };
  trends: Array<{
    date: string;
    score: number;
    category: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    action: string;
  }>;
}

// Export all types for use throughout the application
export type {
  SocietyInfo,
  SocietyVerificationRequest,
  SocietyVerificationResponse,
  SocietySearchRequest,
  SocietySearchResponse,
  UserSocietyAssociation,
  SocietyJoinRequest,
  SocietyJoinResponse,
  EmergencyContactInfo,
  VehicleInfo,
  FamilyMemberInfo,
  FileUpload,
  ValidationError,
  SocietyOnboardingState,
  SocietyOnboardingAnalytics,
  SocietyInvitation,
  SocietyAdmin,
  SocietyPermission,
  UserMultiSocietyProfile,
  SocietyHealthMetrics,
};