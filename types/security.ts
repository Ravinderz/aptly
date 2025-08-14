// Security Guard and Visitor Management Types
import { Visitor } from './api';

// Security Guard Profile interface as per the implementation plan
export interface SecurityGuardProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'security_guard';
  securityInfo: {
    employeeId: string;
    shift: 'morning' | 'afternoon' | 'night' | 'rotating';
    assignedSocieties: string[]; // Society IDs
    permissions: {
      canCreateVisitor: boolean;
      canCheckInOut: boolean;
      canViewHistory: boolean;
      canHandleEmergency: boolean;
      canManageVehicles: boolean;
    };
    certifications: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced visitor data structure for security operations
export interface SecurityVisitor extends Omit<Visitor, 'status'> {
  // Override status to include security-specific statuses
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'expired' | 'scheduled' | 'inside' | 'overstay' | 'emergency' | 'blocked';
  
  // Security-specific information
  securityInfo: {
    idVerified: boolean;
    idType: 'license' | 'passport' | 'national_id' | 'other';
    idNumber?: string;
    photoUrl?: string;
    vehicleInfo?: {
      type: 'car' | 'bike' | 'bicycle' | 'none';
      number?: string;
      make?: string;
      model?: string;
      color?: string;
      parkingSpot?: string;
    };
    checkInBy: string; // Security guard ID
    checkOutBy?: string; // Security guard ID  
    securityNotes?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // Enhanced timing information
  timing: {
    scheduledTime: Date;
    actualCheckIn?: Date;
    expectedDuration: number; // hours
    expectedCheckOut: Date;
    actualCheckOut?: Date;
    overstayThreshold: Date;
    overstayNotified: boolean;
  };
  
  // Comprehensive audit trail
  auditLog: SecurityAuditLogEntry[];
  
  // Visit purpose and details
  visitInfo: {
    purpose: 'meeting' | 'delivery' | 'service' | 'social' | 'emergency' | 'other';
    description: string;
    hostResident: {
      id: string;
      name: string;
      unit: string;
      phone: string;
    };
    approvalRequired: boolean;
    approvalStatus?: 'pending' | 'approved' | 'denied';
    approvedBy?: string;
  };
}

// Security audit logging structure
export interface SecurityAuditLogEntry {
  id: string;
  timestamp: Date;
  guardId: string;
  guardName: string;
  action: 'check_in' | 'check_out' | 'status_update' | 'emergency' | 'note_added' | 'vehicle_registered';
  resource: string; // visitor, vehicle, etc.
  resourceId: string;
  details: {
    before?: any;
    after?: any;
    reason?: string;
    ipAddress: string;
    deviceInfo: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Security permissions interface
export interface SecurityPermissions {
  canCreateVisitor: boolean;
  canCheckInOut: boolean;
  canViewHistory: boolean;
  canHandleEmergency: boolean;
  canManageVehicles: boolean;
  canAccessReports: boolean;
  canModifyVisitorData: boolean;
  canOverrideApprovals: boolean;
}

// Security dashboard statistics
export interface SecurityDashboardStats {
  visitorsInside: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  overstayingVisitors: number;
  pendingApprovals: number;
  vehiclesParked: number;
  emergencyAlerts: number;
  systemStatus: 'operational' | 'degraded' | 'maintenance';
}

// Emergency alert types
export interface EmergencyAlert {
  id: string;
  type: 'security' | 'medical' | 'fire' | 'evacuation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string[];
  resolvedAt?: Date;
  resolutionNotes?: string;
}

// Vehicle management types
export interface SecurityVehicle {
  id: string;
  type: 'car' | 'bike' | 'bicycle' | 'truck' | 'other';
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  ownerType: 'visitor' | 'resident' | 'service';
  ownerId: string;
  ownerName: string;
  parkingSpot?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  expectedDepartureTime?: Date;
  status: 'parked' | 'departed' | 'overstay';
  notes?: string;
  registeredBy: string; // Security guard ID
}

// Security guard session management
export interface SecuritySession {
  id: string;
  guardId: string;
  shiftStart: Date;
  shiftEnd?: Date;
  status: 'active' | 'ended';
  activities: SecurityActivity[];
}

export interface SecurityActivity {
  id: string;
  type: 'check_in' | 'check_out' | 'vehicle_entry' | 'emergency' | 'patrol' | 'incident';
  timestamp: Date;
  description: string;
  relatedEntityId?: string; // visitor ID, vehicle ID, etc.
  notes?: string;
}

// Form data types for security operations
export interface VisitorCheckInFormData {
  visitorId?: string;
  name: string;
  phoneNumber: string;
  purpose: string;
  hostFlatNumber: string;
  expectedDuration: number;
  idType: 'license' | 'passport' | 'national_id' | 'other';
  idNumber?: string;
  vehicleDetails?: {
    type: 'car' | 'bike' | 'bicycle' | 'none';
    number?: string;
    make?: string;
    model?: string;
    color?: string;
  };
  photo?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialInstructions?: string;
}

export interface VisitorCheckOutFormData {
  visitorId: string;
  actualDepartureTime: Date;
  notes?: string;
  vehicleDeparted?: boolean;
  feedbackRating?: number;
  feedbackComments?: string;
}

export interface VehicleRegistrationFormData {
  type: 'car' | 'bike' | 'bicycle' | 'truck' | 'other';
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  ownerType: 'visitor' | 'resident' | 'service';
  ownerId: string;
  ownerName: string;
  expectedDepartureTime?: Date;
  parkingSpot?: string;
  notes?: string;
}

// Security guard route permissions
export interface SecurityRoutePermission {
  route: string;
  permission: keyof SecurityPermissions;
  fallbackRoute?: string;
}

// Security notification types
export interface SecurityNotification {
  id: string;
  type: 'visitor_arrival' | 'overstay_alert' | 'emergency' | 'system_alert' | 'shift_change';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
  relatedEntityId?: string;
  expiresAt?: Date;
}

// Security preferences
export interface SecurityPreferences {
  notifications: {
    visitorArrivals: boolean;
    overstayAlerts: boolean;
    emergencyAlerts: boolean;
    systemNotifications: boolean;
  };
  autoCheckout: {
    enabled: boolean;
    timeoutMinutes: number;
  };
  defaultVisitorDuration: number; // minutes
  requirePhotoForVisitors: boolean;
  requireIdVerification: boolean;
  enableVehicleTracking: boolean;
}