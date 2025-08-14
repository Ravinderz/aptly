// Validation utilities for form inputs

// Indian phone number validation
export const validateIndianPhoneNumber = (phone: string): boolean => {
  // Remove any spaces, dashes, or special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it's a valid Indian mobile number
  // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  // If it starts with +91, remove it
  if (cleanPhone.startsWith('+91')) {
    return indianMobileRegex.test(cleanPhone.substring(3));
  }

  // If it starts with 91, remove it
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return indianMobileRegex.test(cleanPhone.substring(2));
  }

  // If it's 10 digits, check directly
  return indianMobileRegex.test(cleanPhone);
};

// Format phone number for display
export const formatIndianPhoneNumber = (phone: string): string => {
  // Remove any existing formatting
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Remove +91 or 91 prefix if present
  let number = cleanPhone;
  if (cleanPhone.startsWith('+91')) {
    number = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    number = cleanPhone.substring(2);
  }

  // Add formatting: XXX XXX XXXX
  if (number.length >= 6) {
    return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 10)}`.trim();
  } else if (number.length >= 3) {
    const remaining = number.substring(3);
    return remaining
      ? `${number.substring(0, 3)} ${remaining}`.trim()
      : number.substring(0, 3);
  }

  return number;
};

// Get full phone number with country code
export const getFullIndianPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // If already has country code, return as is
  if (cleanPhone.startsWith('+91')) {
    return cleanPhone;
  }

  // If starts with 91, add +
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  }

  // Add +91 prefix for Indian numbers
  return `+91${cleanPhone}`;
};

// Clean phone number for processing
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\+]/g, '');
};

// Validate emergency contact phone number (10 digits only)
export const validateEmergencyContact = (
  phone: string,
): { isValid: boolean; error?: string } => {
  const cleaned = cleanPhoneNumber(phone);

  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  if (!validateIndianPhoneNumber(cleaned)) {
    return { isValid: false, error: 'Invalid Indian mobile number' };
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email) return false;

  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Additional checks for common invalid patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }

  if (email.startsWith('@') || email.endsWith('@')) {
    return false;
  }

  return emailRegex.test(email);
};

// Society code validation
export const validateSocietyCode = (code: string): boolean => {
  // Society code should be 6-8 alphanumeric characters
  const societyCodeRegex = /^[A-Z0-9]{6,8}$/;
  return societyCodeRegex.test(code.toUpperCase());
};

// Name validation
export const validateName = (
  name: string,
): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  // Allow letters, spaces, and common name characters
  const nameRegex = /^[a-zA-Z\s\.\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error:
        'Name can only contain letters, spaces, dots, hyphens, and apostrophes',
    };
  }

  return { isValid: true };
};

// Relationship validation for emergency contacts
export const validateRelationship = (
  relationship: string,
): { isValid: boolean; error?: string } => {
  const validRelationships = [
    'Wife',
    'Husband',
    'Father',
    'Mother',
    'Son',
    'Daughter',
    'Brother',
    'Sister',
    'Friend',
    'Doctor',
    'Other',
  ];

  if (!relationship) {
    return { isValid: false, error: 'Relationship is required' };
  }

  if (!validRelationships.includes(relationship)) {
    return { isValid: false, error: 'Please select a valid relationship' };
  }

  return { isValid: true };
};

// Address validation
export const validateAddress = (
  address: string,
): { isValid: boolean; error?: string } => {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return { isValid: false, error: 'Address is required' };
  }

  if (trimmedAddress.length < 10) {
    return {
      isValid: false,
      error: 'Address must be at least 10 characters long',
    };
  }

  if (trimmedAddress.length > 200) {
    return {
      isValid: false,
      error: 'Address must be less than 200 characters',
    };
  }

  return { isValid: true };
};

// Generic required field validation
export const validateRequired = (
  value: string,
  fieldName: string,
): { isValid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

// Numeric validation
export const validateNumeric = (
  value: string,
  fieldName: string,
): { isValid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (isNaN(Number(value))) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  return { isValid: true };
};

// Amount validation (for billing)
export const validateAmount = (
  amount: string,
): { isValid: boolean; error?: string } => {
  if (!amount || !amount.trim()) {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 100000) {
    return { isValid: false, error: 'Amount cannot exceed ₹1,00,000' };
  }

  return { isValid: true };
};

// Pincode validation (Indian postal codes)
export const validatePincode = (
  pincode: string,
): { isValid: boolean; error?: string } => {
  const cleanPincode = pincode.trim();

  if (!cleanPincode) {
    return { isValid: false, error: 'Pincode is required' };
  }

  // Indian pincode format: 6 digits
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincodeRegex.test(cleanPincode)) {
    return {
      isValid: false,
      error: 'Pincode must be 6 digits and cannot start with 0',
    };
  }

  return { isValid: true };
};

// Vehicle number validation (Indian format)
export const validateVehicleNumber = (
  vehicleNumber: string,
): { isValid: boolean; error?: string } => {
  const cleanVehicle = vehicleNumber.trim().toUpperCase().replace(/\s/g, '');

  if (!cleanVehicle) {
    return { isValid: false, error: 'Vehicle number is required' };
  }

  // Indian vehicle number formats:
  // Old format: XX XX XXXX (state code + district code + 4 digits)
  // New format: XX XX XX XXXX (state code + district code + series + 4 digits)
  const oldFormatRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{0,2}[0-9]{4}$/;
  const newFormatRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

  if (
    !oldFormatRegex.test(cleanVehicle) &&
    !newFormatRegex.test(cleanVehicle)
  ) {
    return { isValid: false, error: 'Invalid vehicle number format' };
  }

  return { isValid: true };
};

// GST number validation
export const validateGSTNumber = (
  gstNumber: string,
): { isValid: boolean; error?: string } => {
  const cleanGST = gstNumber.trim().toUpperCase().replace(/\s/g, '');

  if (!cleanGST) {
    return { isValid: false, error: 'GST number is required' };
  }

  // GST format: 15 characters (2 state code + 10 PAN + 1 entity code + 1 check digit + 1 default)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;

  if (cleanGST.length !== 15) {
    return { isValid: false, error: 'GST number must be 15 characters' };
  }

  if (!gstRegex.test(cleanGST)) {
    return { isValid: false, error: 'Invalid GST number format' };
  }

  return { isValid: true };
};

// Aadhar number validation
export const validateAadharNumber = (
  aadharNumber: string,
): { isValid: boolean; error?: string } => {
  const cleanAadhar = aadharNumber.replace(/\s/g, '');

  if (!cleanAadhar) {
    return { isValid: false, error: 'Aadhar number is required' };
  }

  if (cleanAadhar.length !== 12) {
    return { isValid: false, error: 'Aadhar number must be 12 digits' };
  }

  if (!/^[0-9]{12}$/.test(cleanAadhar)) {
    return { isValid: false, error: 'Aadhar number must contain only digits' };
  }

  // Basic validation: cannot start with 0 or 1
  if (cleanAadhar.startsWith('0') || cleanAadhar.startsWith('1')) {
    return { isValid: false, error: 'Invalid Aadhar number' };
  }

  return { isValid: true };
};

// PAN card validation
export const validatePANNumber = (
  panNumber: string,
): { isValid: boolean; error?: string } => {
  const cleanPAN = panNumber.trim().toUpperCase().replace(/\s/g, '');

  if (!cleanPAN) {
    return { isValid: false, error: 'PAN number is required' };
  }

  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (cleanPAN.length !== 10) {
    return { isValid: false, error: 'PAN number must be 10 characters' };
  }

  if (!panRegex.test(cleanPAN)) {
    return { isValid: false, error: 'Invalid PAN number format' };
  }

  return { isValid: true };
};

// IFSC code validation
export const validateIFSCCode = (
  ifscCode: string,
): { isValid: boolean; error?: string } => {
  const cleanIFSC = ifscCode.trim().toUpperCase().replace(/\s/g, '');

  if (!cleanIFSC) {
    return { isValid: false, error: 'IFSC code is required' };
  }

  // IFSC format: 4 letters (bank code) + 0 + 6 characters (branch code)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (cleanIFSC.length !== 11) {
    return { isValid: false, error: 'IFSC code must be 11 characters' };
  }

  if (!ifscRegex.test(cleanIFSC)) {
    return { isValid: false, error: 'Invalid IFSC code format' };
  }

  return { isValid: true };
};

// Password strength validation
export const validatePassword = (
  password: string,
): {
  isValid: boolean;
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const criteriaCount = [
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecial,
  ].filter(Boolean).length;

  if (criteriaCount >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (criteriaCount >= 3 && password.length >= 8) {
    strength = 'medium';
  }

  if (criteriaCount < 2) {
    return {
      isValid: false,
      error:
        'Password must contain at least 2 of: uppercase, lowercase, numbers, special characters',
      strength,
    };
  }

  return { isValid: true, strength };
};

// File size validation
export const validateFileSize = (
  fileSizeBytes: number,
  maxSizeMB: number = 5,
): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

// File type validation
export const validateFileType = (
  fileName: string,
  allowedTypes: string[],
): { isValid: boolean; error?: string } => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  if (!fileExtension) {
    return { isValid: false, error: 'File must have an extension' };
  }

  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { isValid: true };
};

// Date validation
export const validateDate = (
  date: string | Date,
  fieldName: string = 'Date',
): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }

  return { isValid: true };
};

// Future date validation
export const validateFutureDate = (
  date: string | Date,
  fieldName: string = 'Date',
): { isValid: boolean; error?: string } => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const dateObj = new Date(date);
  const now = new Date();

  if (dateObj <= now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  return { isValid: true };
};

// Age validation
export const validateAge = (
  birthDate: string | Date,
  minAge: number = 18,
  maxAge: number = 120,
): { isValid: boolean; error?: string } => {
  const dateValidation = validateDate(birthDate, 'Birth date');
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const birth = new Date(birthDate);
  const now = new Date();
  const age = Math.floor(
    (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  if (age < minAge) {
    return { isValid: false, error: `Age must be at least ${minAge} years` };
  }

  if (age > maxAge) {
    return { isValid: false, error: `Age cannot be more than ${maxAge} years` };
  }

  return { isValid: true };
};

// URL validation
export const validateURL = (
  url: string,
): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Form validation helper
export const validateForm = (
  fields: Record<string, any>,
  validators: Record<
    string,
    (value: any) => { isValid: boolean; error?: string }
  >,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(validators).forEach((fieldName) => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    const result = validator(value);

    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Debounced validation helper
export const createDebouncedValidator = (
  validator: (value: any) => { isValid: boolean; error?: string },
  delay: number = 500,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (
    value: any,
    callback: (result: { isValid: boolean; error?: string }) => void,
  ) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(validator(value));
    }, delay);
  };
};
