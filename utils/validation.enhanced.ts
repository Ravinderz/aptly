/**
 * Enhanced Form Validation System
 * Comprehensive validation utilities using Zod for React Native forms
 */

import { z } from 'zod';

// Common validation schemas
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => {
    if (!val || typeof val !== 'string') return '';

    // Remove all non-digit characters (spaces, dashes, parentheses, etc.)
    let cleaned = val.replace(/\D/g, '');

    // Handle country code prefixes
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      // Remove +91 or 91 prefix for Indian numbers
      cleaned = cleaned.substring(2);
    }

    return cleaned;
  })
  .pipe(
    z
      .string()
      .min(1, 'Phone number is required')
      .min(1, 'Please input 10 digit mobile number')
      .max(10, 'Phone number cannot exceed 10 digits')
      .regex(
        /^[6-9]\d{9}$/,
        'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9',
      ),
  );

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const flatNumberSchema = z
  .string()
  .min(1, 'Flat number is required')
  .regex(
    /^[A-Z]?-?\d+[A-Z]?$/i,
    'Please enter a valid flat number (e.g., A-201, 101, B-5)',
  );

export const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain at least one number')
  .regex(
    /(?=.*[@$!%*?&])/,
    'Password must contain at least one special character',
  );

export const societyCodeSchema = z
  .string()
  .min(1, 'Society code is required')
  .min(4, 'Society code must be at least 4 characters')
  .max(20, 'Society code must not exceed 20 characters')
  .regex(
    /^[A-Z0-9_-]+$/i,
    'Society code can only contain letters, numbers, underscore, and dash',
  );

// Authentication forms
export const phoneRegistrationSchema = z.object({
  phone: phoneSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'Please accept the terms and conditions',
  }),
});

export const emailRegistrationSchema = z.object({
  email: emailSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'Please accept the terms and conditions',
  }),
});

export const otpVerificationSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const profileSetupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  flatNumber: flatNumberSchema,
  emergencyContact: phoneSchema.optional(),
});

export const societyVerificationSchema = z.object({
  societyCode: societyCodeSchema,
});

// Community forms
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .min(10, 'Post content must be at least 10 characters')
    .max(1000, 'Post content must not exceed 1000 characters'),
  category: z.enum(
    ['announcement', 'buy_sell', 'lost_found', 'events', 'general'],
    {
      errorMap: () => ({ message: 'Please select a valid category' }),
    },
  ),
  imageUrl: z
    .string()
    .url('Please enter a valid image URL')
    .optional()
    .or(z.literal('')),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment is required')
    .min(3, 'Comment must be at least 3 characters')
    .max(500, 'Comment must not exceed 500 characters'),
  postId: z.string().min(1, 'Post ID is required'),
  parentId: z.string().optional(),
});

// Visitor forms
export const createVisitorSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  purpose: z
    .string()
    .min(1, 'Purpose of visit is required')
    .min(5, 'Purpose must be at least 5 characters')
    .max(200, 'Purpose must not exceed 200 characters'),
  expectedDuration: z
    .number()
    .min(15, 'Minimum visit duration is 15 minutes')
    .max(480, 'Maximum visit duration is 8 hours'), // in minutes
  vehicleNumber: z
    .string()
    .regex(
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
      'Please enter a valid vehicle number',
    )
    .optional()
    .or(z.literal('')),
  guestCount: z
    .number()
    .min(1, 'At least 1 guest is required')
    .max(10, 'Maximum 10 guests allowed'),
  visitDate: z.date({
    required_error: 'Visit date is required',
    invalid_type_error: 'Please select a valid date',
  }),
  visitTime: z.date({
    required_error: 'Visit time is required',
    invalid_type_error: 'Please select a valid time',
  }),
});

// Maintenance forms
export const maintenanceRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  category: z.enum(
    ['plumbing', 'electrical', 'carpentry', 'painting', 'general', 'emergency'],
    {
      errorMap: () => ({ message: 'Please select a valid category' }),
    },
  ),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a priority level' }),
  }),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(100, 'Location must not exceed 100 characters'),
  preferredTime: z
    .enum(['morning', 'afternoon', 'evening', 'anytime'], {
      errorMap: () => ({ message: 'Please select a preferred time' }),
    })
    .optional(),
});

// Vehicle registration forms
export const vehicleRegistrationSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .regex(
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
      'Please enter a valid vehicle number (e.g., MH12AB1234)',
    ),
  vehicleType: z.enum(['car', 'bike', 'scooter', 'cycle', 'other'], {
    errorMap: () => ({ message: 'Please select a vehicle type' }),
  }),
  brand: z
    .string()
    .min(1, 'Brand is required')
    .max(50, 'Brand must not exceed 50 characters'),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model must not exceed 50 characters'),
  color: z
    .string()
    .min(1, 'Color is required')
    .max(30, 'Color must not exceed 30 characters'),
  parkingSlot: z
    .string()
    .min(1, 'Parking slot is required')
    .max(20, 'Parking slot must not exceed 20 characters')
    .optional(),
});

// Billing forms
export const billPaymentSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .max(100000, 'Amount must not exceed ₹1,00,000'),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  billId: z.string().min(1, 'Bill ID is required'),
});

// Emergency contact forms
export const emergencyContactSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  relation: z.enum(
    ['spouse', 'parent', 'child', 'sibling', 'friend', 'colleague', 'other'],
    {
      errorMap: () => ({ message: 'Please select a relation' }),
    },
  ),
  isDefault: z.boolean().optional(),
});

// Family member forms
export const familyMemberSchema = z.object({
  name: nameSchema,
  relation: z.enum(['spouse', 'parent', 'child', 'sibling', 'other'], {
    errorMap: () => ({ message: 'Please select a relation' }),
  }),
  age: z
    .number()
    .min(0, 'Age cannot be negative')
    .max(150, 'Please enter a valid age'),
  phone: phoneSchema.optional(),
  occupation: z
    .string()
    .max(100, 'Occupation must not exceed 100 characters')
    .optional(),
});

// Notification settings
export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  categories: z.object({
    announcements: z.boolean(),
    maintenance: z.boolean(),
    visitors: z.boolean(),
    billing: z.boolean(),
    community: z.boolean(),
    security: z.boolean(),
    events: z.boolean(),
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Please enter a valid time (HH:MM)',
      ),
    endTime: z
      .string()
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Please enter a valid time (HH:MM)',
      ),
  }),
});

// Utility types
export type PhoneRegistrationForm = z.infer<typeof phoneRegistrationSchema>;
export type EmailRegistrationForm = z.infer<typeof emailRegistrationSchema>;
export type OTPVerificationForm = z.infer<typeof otpVerificationSchema>;
export type ProfileSetupForm = z.infer<typeof profileSetupSchema>;
export type SocietyVerificationForm = z.infer<typeof societyVerificationSchema>;
export type CreatePostForm = z.infer<typeof createPostSchema>;
export type CreateCommentForm = z.infer<typeof createCommentSchema>;
export type CreateVisitorForm = z.infer<typeof createVisitorSchema>;
export type MaintenanceRequestForm = z.infer<typeof maintenanceRequestSchema>;
export type VehicleRegistrationForm = z.infer<typeof vehicleRegistrationSchema>;
export type BillPaymentForm = z.infer<typeof billPaymentSchema>;
export type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;
export type FamilyMemberForm = z.infer<typeof familyMemberSchema>;
export type NotificationSettingsForm = z.infer<
  typeof notificationSettingsSchema
>;

// Validation utility functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    return { isValid: false, error: 'Unknown validation error' };
  }
};

export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  isValid: boolean;
  errors?: Record<string, string>;
  data?: T;
} => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Unknown validation error' } };
  }
};

// Real-time validation for form fields
export const createFieldValidator = <T>(schema: z.ZodSchema<T>) => {
  return (value: unknown) => validateField(schema, value);
};

// Custom validation hooks for React Native
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: unknown) => validateForm(schema, data);
  const validateField = (field: keyof T, value: unknown) => {
    // Extract the specific field schema
    try {
      const fieldSchema = (schema as any).shape[field];
      if (fieldSchema) {
        return validateField(fieldSchema, value);
      }
      return { isValid: true };
    } catch {
      return { isValid: true };
    }
  };

  return { validate, validateField };
};

// Pre-built validation messages
export const ValidationMessages = {
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, length: number) =>
    `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) =>
    `${field} must not exceed ${length} characters`,
  INVALID_FORMAT: (field: string) =>
    `Please enter a valid ${field.toLowerCase()}`,
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_OTP: 'Please enter a valid 6-digit OTP',
  TERMS_REQUIRED: 'Please accept the terms and conditions',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  WEAK_PASSWORD:
    'Password is too weak. Please include uppercase, lowercase, numbers, and special characters',
} as const;
