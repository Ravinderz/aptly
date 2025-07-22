import {
  validateIndianPhoneNumber,
  formatIndianPhoneNumber,
  validateEmergencyContact,
  validateEmail,
  validateSocietyCode,
  validateName,
  validatePincode,
  validateVehicleNumber,
  validateGSTNumber,
  validatePANNumber,
  validateIFSCCode,
  validatePassword,
  validateAmount,
  validateForm
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validateIndianPhoneNumber', () => {
    test('should validate correct Indian phone numbers', () => {
      expect(validateIndianPhoneNumber('9876543210')).toBe(true);
      expect(validateIndianPhoneNumber('8765432109')).toBe(true);
      expect(validateIndianPhoneNumber('7654321098')).toBe(true);
      expect(validateIndianPhoneNumber('6543210987')).toBe(true);
    });

    test('should validate phone numbers with country code', () => {
      expect(validateIndianPhoneNumber('+919876543210')).toBe(true);
      expect(validateIndianPhoneNumber('919876543210')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(validateIndianPhoneNumber('1234567890')).toBe(false);
      expect(validateIndianPhoneNumber('12345')).toBe(false);
      expect(validateIndianPhoneNumber('abcdefghij')).toBe(false);
      expect(validateIndianPhoneNumber('5876543210')).toBe(false);
    });

    test('should handle formatted phone numbers', () => {
      expect(validateIndianPhoneNumber('987-654-3210')).toBe(true);
      expect(validateIndianPhoneNumber('987 654 3210')).toBe(true);
      expect(validateIndianPhoneNumber('(987) 654-3210')).toBe(true);
    });
  });

  describe('formatIndianPhoneNumber', () => {
    test('should format phone numbers correctly', () => {
      expect(formatIndianPhoneNumber('9876543210')).toBe('987 654 3210');
      expect(formatIndianPhoneNumber('+919876543210')).toBe('987 654 3210');
      expect(formatIndianPhoneNumber('919876543210')).toBe('987 654 3210');
    });

    test('should handle partial phone numbers', () => {
      expect(formatIndianPhoneNumber('987654')).toBe('987 654');
      expect(formatIndianPhoneNumber('987')).toBe('987');
    });
  });

  describe('validateEmergencyContact', () => {
    test('should validate correct emergency contacts', () => {
      const result = validateEmergencyContact('9876543210');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid emergency contacts', () => {
      const result1 = validateEmergencyContact('');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Phone number is required');

      const result2 = validateEmergencyContact('123456789');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Phone number must be exactly 10 digits');

      const result3 = validateEmergencyContact('1234567890');
      expect(result3.isValid).toBe(false);
      expect(result3.error).toBe('Invalid Indian mobile number');
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.in')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test..test@example.com')).toBe(false);
    });
  });

  describe('validateSocietyCode', () => {
    test('should validate correct society codes', () => {
      expect(validateSocietyCode('ABC123')).toBe(true);
      expect(validateSocietyCode('XYZ789')).toBe(true);
      expect(validateSocietyCode('TEST001')).toBe(true);
      expect(validateSocietyCode('SOCIETY1')).toBe(true);
    });

    test('should reject invalid society codes', () => {
      expect(validateSocietyCode('AB12')).toBe(false); // too short
      expect(validateSocietyCode('TOOLONGCODE')).toBe(false); // too long
      expect(validateSocietyCode('abc123')).toBe(true); // should convert to uppercase
      expect(validateSocietyCode('ABC-123')).toBe(false); // contains special chars
    });
  });

  describe('validatePincode', () => {
    test('should validate correct pincodes', () => {
      const result1 = validatePincode('400001');
      expect(result1.isValid).toBe(true);

      const result2 = validatePincode('110001');
      expect(result2.isValid).toBe(true);
    });

    test('should reject invalid pincodes', () => {
      const result1 = validatePincode('000000');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Pincode must be 6 digits and cannot start with 0');

      const result2 = validatePincode('12345');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Pincode must be 6 digits and cannot start with 0');

      const result3 = validatePincode('');
      expect(result3.isValid).toBe(false);
      expect(result3.error).toBe('Pincode is required');
    });
  });

  describe('validateVehicleNumber', () => {
    test('should validate correct vehicle numbers', () => {
      const result1 = validateVehicleNumber('MH12AB1234');
      expect(result1.isValid).toBe(true);

      const result2 = validateVehicleNumber('DL01CA9999');
      expect(result2.isValid).toBe(true);

      const result3 = validateVehicleNumber('KA051234');
      expect(result3.isValid).toBe(true);
    });

    test('should reject invalid vehicle numbers', () => {
      const result1 = validateVehicleNumber('INVALID');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Invalid vehicle number format');

      const result2 = validateVehicleNumber('');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Vehicle number is required');
    });
  });

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      const result = validatePassword('MyStr0ngP@ssw0rd');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    test('should validate medium passwords', () => {
      const result = validatePassword('MyPassword123');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('medium');
    });

    test('should reject weak passwords', () => {
      const result1 = validatePassword('weak');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Password must be at least 8 characters long');

      const result2 = validatePassword('password');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Password must contain at least 2 of: uppercase, lowercase, numbers, special characters');
    });
  });

  describe('validateAmount', () => {
    test('should validate correct amounts', () => {
      const result1 = validateAmount('100');
      expect(result1.isValid).toBe(true);

      const result2 = validateAmount('99999.99');
      expect(result2.isValid).toBe(true);
    });

    test('should reject invalid amounts', () => {
      const result1 = validateAmount('0');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Amount must be greater than 0');

      const result2 = validateAmount('200000');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Amount cannot exceed ₹1,00,000');

      const result3 = validateAmount('invalid');
      expect(result3.isValid).toBe(false);
      expect(result3.error).toBe('Amount must be a valid number');
    });
  });

  describe('validateForm', () => {
    test('should validate form with all valid fields', () => {
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210'
      };

      const validators = {
        name: (value: string) => validateName(value),
        email: (value: string) => ({ isValid: validateEmail(value), error: validateEmail(value) ? undefined : 'Invalid email' }),
        phone: (value: string) => validateEmergencyContact(value)
      };

      const result = validateForm(fields, validators);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return errors for invalid fields', () => {
      const fields = {
        name: '',
        email: 'invalid-email',
        phone: '123'
      };

      const validators = {
        name: (value: string) => validateName(value),
        email: (value: string) => ({ isValid: validateEmail(value), error: validateEmail(value) ? undefined : 'Invalid email' }),
        phone: (value: string) => validateEmergencyContact(value)
      };

      const result = validateForm(fields, validators);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.name).toBe('Name is required');
      expect(result.errors.email).toBe('Invalid email');
      expect(result.errors.phone).toBe('Phone number must be exactly 10 digits');
    });
  });
});