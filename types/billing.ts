// Billing system type definitions

// Payment method types
export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  name: string;
  provider: string;
  details: string; // Last 4 digits for cards, UPI ID, etc.
  isDefault: boolean;
  icon?: string;
  createdAt: string;
}

// Billing service types
export type BillingService =
  | 'mobile-recharge'
  | 'broadband-recharge'
  | 'cylinder-booking'
  | 'gas-recharge'
  | 'dishtv-recharge'
  | 'electricity-bill';

// Mobile recharge specific types
export interface MobileOperator {
  id: string;
  name: string;
  code: string;
  icon: string;
  supportedStates: string[];
}

export interface RechargePlan {
  id: string;
  operatorId: string;
  amount: number;
  validity: number; // days
  description: string;
  benefits: string[];
  planType: 'prepaid' | 'postpaid';
  category: 'popular' | 'data' | 'talk' | 'fulltt' | 'roaming';
}

export interface MobileRechargeRequest {
  phoneNumber: string;
  operatorId: string;
  planId?: string;
  amount: number;
  planType: 'prepaid' | 'postpaid';
}

// Broadband recharge types
export interface BroadbandProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
  connectionTypes: ('fiber' | 'broadband')[];
  customerIdFormat: string;
}

export interface BroadbandPlan {
  id: string;
  providerId: string;
  name: string;
  speed: string;
  dataLimit: string;
  amount: number;
  validity: number; // days
  benefits: string[];
}

export interface BroadbandRechargeRequest {
  customerId: string;
  providerId: string;
  planId?: string;
  amount: number;
  connectionType: 'fiber' | 'broadband';
}

// Gas cylinder booking types
export interface LPGProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
  cylinderSizes: CylinderSize[];
  serviceAreas: string[];
}

export interface CylinderSize {
  size: '5kg' | '14.2kg' | '19kg';
  price: number;
  availableSlots: DeliverySlot[];
}

export interface DeliverySlot {
  id: string;
  date: string;
  timeSlot: string;
  isExpress: boolean;
  additionalCharge: number;
  isAvailable: boolean;
  popular?: boolean;
}

export interface CylinderBookingRequest {
  customerId: string;
  providerId: string;
  cylinderSize: CylinderSize['size'];
  deliverySlotId: string;
  deliveryAddress: string;
  expressDelivery: boolean;
}

// PNG recharge types
export interface PNGProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
  serviceType: 'cng' | 'domestic';
  customerIdFormat: string;
  bonusRates: { [amount: number]: number };
}

export interface PNGRechargeRequest {
  customerId: string;
  providerId: string;
  amount: number;
  serviceType: 'cng' | 'domestic';
}

// DTH recharge types
export interface DTHProvider {
  id: string;
  name: string;
  code: string;
  icon: string;
  packages: DTHPackage[];
}

export interface DTHPackage {
  id: string;
  name: string;
  price: number;
  validity: number; // days
  channelCount: number;
  description: string;
  category: 'essential' | 'sports' | 'premium' | 'regional';
  channels: string[];
}

export interface DTHRechargeRequest {
  subscriberId: string;
  providerId: string;
  packageId?: string;
  amount: number;
}

// Cashback and commission types
export interface CashbackRate {
  service: BillingService;
  baseRate: number; // percentage
  upiBonus: number; // additional percentage for UPI
  maxAmount: number; // maximum cashback amount
  minTransaction: number; // minimum transaction amount
}

export interface Transaction {
  id: string;
  service: BillingService;
  amount: number;
  cashbackAmount: number;
  paymentMethod: PaymentMethod['type'];
  status: 'pending' | 'success' | 'failed' | 'refunded';
  billerDetails: BillerTransaction;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

// Service-specific transaction details
export type BillerTransaction =
  | MobileTransaction
  | BroadbandTransaction
  | CylinderTransaction
  | PNGTransaction
  | DTHTransaction;

export interface MobileTransaction {
  type: 'mobile-recharge';
  phoneNumber: string;
  operator: string;
  planType: 'prepaid' | 'postpaid';
  planDetails?: RechargePlan;
}

export interface BroadbandTransaction {
  type: 'broadband-recharge';
  customerId: string;
  provider: string;
  connectionType: 'fiber' | 'broadband';
  planDetails?: BroadbandPlan;
}

export interface CylinderTransaction {
  type: 'cylinder-booking';
  customerId: string;
  provider: string;
  cylinderSize: CylinderSize['size'];
  deliveryAddress: string;
  deliverySlot: DeliverySlot;
  trackingNumber?: string;
}

export interface PNGTransaction {
  type: 'gas-recharge';
  customerId: string;
  provider: string;
  serviceType: 'cng' | 'domestic';
  bonusAmount: number;
}

export interface DTHTransaction {
  type: 'dishtv-recharge';
  subscriberId: string;
  provider: string;
  packageDetails?: DTHPackage;
}

// Society billing types
export interface SocietyBill {
  id: string;
  flatNumber: string;
  residentId: string;
  billType: 'maintenance' | 'parking' | 'amenity' | 'penalty' | 'other';
  month: string; // YYYY-MM format
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  description: string;
  breakdown: BillLineItem[];
  lateFee: number;
  discount: number;
  gstAmount: number;
  totalAmount: number;
  paymentHistory: BillPayment[];
  waterUsage?: {
    previousReading: number;
    currentReading: number;
    consumption: number;
    rate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: string;
}

export interface BillPayment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod['type'];
  transactionId: string;
  paidAt: string;
  status: 'success' | 'failed' | 'pending';
}

// Billing settings and preferences
export interface BillingSettings {
  autoPayEnabled: boolean;
  autoPayAmount: number;
  autoPayMethod?: PaymentMethod;
  reminderSettings: {
    enabled: boolean;
    daysBefore: number[];
    channels: ('push' | 'email' | 'sms')[];
  };
  receiptSettings: {
    emailReceipts: boolean;
    smsReceipts: boolean;
    downloadReceipts: boolean;
  };
  gstSettings: {
    gstNumber?: string;
    billingAddress: string;
    companyName?: string;
  };
}

// Form data types
export interface PaymentFormData {
  amount: number;
  paymentMethodId: string;
  billingAddress?: string;
  savePaymentMethod: boolean;
}

export interface AutoPayRule {
  id: string;
  service?: BillingService;
  maxAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  paymentMethodId: string;
  isActive: boolean;
  nextRunDate: string;
  totalLimit: number;
  usedAmount: number;
  createdAt: string;
}

// Analytics and reporting types
export interface BillingAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalSpent: number;
  totalCashback: number;
  transactionCount: number;
  serviceBreakdown: { [service in BillingService]?: number };
  paymentMethodBreakdown: { [method: string]: number };
  monthlyTrend: { month: string; amount: number; cashback: number }[];
  topServices: { service: BillingService; amount: number; count: number }[];
}

// Error and validation types
export interface BillingError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface BillingValidationResult {
  isValid: boolean;
  errors: BillingError[];
  warnings?: string[];
}

// API request/response types
export interface BillingAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: BillingError;
  timestamp: string;
}

export interface BillingAPIRequest {
  service: BillingService;
  payload: any;
  paymentMethod: PaymentMethod;
  metadata?: { [key: string]: any };
}
