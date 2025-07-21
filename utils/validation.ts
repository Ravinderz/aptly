// Validation utilities for form inputs

// Indian phone number validation
export const validateIndianPhoneNumber = (phone: string): boolean => {
  // Remove any spaces, dashes, or special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  
  // Check if it's a valid Indian mobile number
  // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  
  // If it starts with +91, remove it
  if (cleanPhone.startsWith("+91")) {
    return indianMobileRegex.test(cleanPhone.substring(3));
  }
  
  // If it starts with 91, remove it
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    return indianMobileRegex.test(cleanPhone.substring(2));
  }
  
  // If it's 10 digits, check directly
  return indianMobileRegex.test(cleanPhone);
};

// Format phone number for display
export const formatIndianPhoneNumber = (phone: string): string => {
  // Remove any existing formatting
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  
  // Remove +91 or 91 prefix if present
  let number = cleanPhone;
  if (cleanPhone.startsWith("+91")) {
    number = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    number = cleanPhone.substring(2);
  }
  
  // Add formatting: XXX XXX XXXX
  if (number.length >= 6) {
    return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 10)}`;
  } else if (number.length >= 3) {
    return `${number.substring(0, 3)} ${number.substring(3)}`;
  }
  
  return number;
};

// Get full phone number with country code
export const getFullIndianPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  
  // If already has country code, return as is
  if (cleanPhone.startsWith("+91")) {
    return cleanPhone;
  }
  
  // If starts with 91, add +
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  }
  
  // Add +91 prefix for Indian numbers
  return `+91${cleanPhone}`;
};

// Clean phone number for processing
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\+]/g, "");
};

// Validate emergency contact phone number (10 digits only)
export const validateEmergencyContact = (phone: string): { isValid: boolean; error?: string } => {
  const cleaned = cleanPhoneNumber(phone);
  
  if (!cleaned) {
    return { isValid: false, error: "Phone number is required" };
  }
  
  if (cleaned.length !== 10) {
    return { isValid: false, error: "Phone number must be exactly 10 digits" };
  }
  
  if (!validateIndianPhoneNumber(cleaned)) {
    return { isValid: false, error: "Invalid Indian mobile number" };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Society code validation
export const validateSocietyCode = (code: string): boolean => {
  // Society code should be 6-8 alphanumeric characters
  const societyCodeRegex = /^[A-Z0-9]{6,8}$/;
  return societyCodeRegex.test(code.toUpperCase());
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: "Name is required" };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Name must be less than 50 characters" };
  }
  
  // Allow letters, spaces, and common name characters
  const nameRegex = /^[a-zA-Z\s\.\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: "Name can only contain letters, spaces, dots, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
};

// Relationship validation for emergency contacts
export const validateRelationship = (relationship: string): { isValid: boolean; error?: string } => {
  const validRelationships = [
    'Wife', 'Husband', 'Father', 'Mother', 'Son', 'Daughter', 
    'Brother', 'Sister', 'Friend', 'Doctor', 'Other'
  ];
  
  if (!relationship) {
    return { isValid: false, error: "Relationship is required" };
  }
  
  if (!validRelationships.includes(relationship)) {
    return { isValid: false, error: "Please select a valid relationship" };
  }
  
  return { isValid: true };
};

// Address validation
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  const trimmedAddress = address.trim();
  
  if (!trimmedAddress) {
    return { isValid: false, error: "Address is required" };
  }
  
  if (trimmedAddress.length < 10) {
    return { isValid: false, error: "Address must be at least 10 characters long" };
  }
  
  if (trimmedAddress.length > 200) {
    return { isValid: false, error: "Address must be less than 200 characters" };
  }
  
  return { isValid: true };
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

// Numeric validation
export const validateNumeric = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (isNaN(Number(value))) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  return { isValid: true };
};

// Amount validation (for billing)
export const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
  if (!amount || !amount.trim()) {
    return { isValid: false, error: "Amount is required" };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: "Amount must be a valid number" };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }
  
  if (numAmount > 100000) {
    return { isValid: false, error: "Amount cannot exceed ₹1,00,000" };
  }
  
  return { isValid: true };
};

// Form validation helper
export const validateForm = (
  fields: Record<string, any>,
  validators: Record<string, (value: any) => { isValid: boolean; error?: string }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  Object.keys(validators).forEach(fieldName => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    const result = validator(value);
    
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};