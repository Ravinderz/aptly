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
  validateForm,
  validateRelationship,
  validateAddress,
  validateRequired,
  validateNumeric,
  validateAadharNumber,
  validateFileSize,
  validateFileType,
  validateDate,
  validateFutureDate,
  validateAge,
  validateURL,
  getFullIndianPhoneNumber,
  cleanPhoneNumber,
  createDebouncedValidator
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

  describe('validateName', () => {
    test('should validate correct names', () => {
      expect(validateName('John Doe')).toEqual({ isValid: true });
      expect(validateName('Mary-Jane O\'Connor')).toEqual({ isValid: true });
      expect(validateName('Dr. Smith')).toEqual({ isValid: true });
    });

    test('should reject invalid names', () => {
      expect(validateName('')).toEqual({ isValid: false, error: 'Name is required' });
      expect(validateName('A')).toEqual({ isValid: false, error: 'Name must be at least 2 characters long' });
      expect(validateName('A'.repeat(51))).toEqual({ isValid: false, error: 'Name must be less than 50 characters' });
      expect(validateName('John123')).toEqual({ isValid: false, error: 'Name can only contain letters, spaces, dots, hyphens, and apostrophes' });
    });
  });

  describe('validateRelationship', () => {
    test('should validate correct relationships', () => {
      expect(validateRelationship('Father')).toEqual({ isValid: true });
      expect(validateRelationship('Mother')).toEqual({ isValid: true });
      expect(validateRelationship('Friend')).toEqual({ isValid: true });
    });

    test('should reject invalid relationships', () => {
      expect(validateRelationship('')).toEqual({ isValid: false, error: 'Relationship is required' });
      expect(validateRelationship('InvalidRelation')).toEqual({ isValid: false, error: 'Please select a valid relationship' });
    });
  });

  describe('validateAddress', () => {
    test('should validate correct addresses', () => {
      expect(validateAddress('123 Main Street, Anytown')).toEqual({ isValid: true });
    });

    test('should reject invalid addresses', () => {
      expect(validateAddress('')).toEqual({ isValid: false, error: 'Address is required' });
      expect(validateAddress('Short')).toEqual({ isValid: false, error: 'Address must be at least 10 characters long' });
      expect(validateAddress('A'.repeat(201))).toEqual({ isValid: false, error: 'Address must be less than 200 characters' });
    });
  });

  describe('validateRequired', () => {
    test('should validate required fields', () => {
      expect(validateRequired('Valid Value', 'Field')).toEqual({ isValid: true });
    });

    test('should reject empty required fields', () => {
      expect(validateRequired('', 'Field')).toEqual({ isValid: false, error: 'Field is required' });
      expect(validateRequired('   ', 'Field')).toEqual({ isValid: false, error: 'Field is required' });
    });
  });

  describe('validateNumeric', () => {
    test('should validate numeric values', () => {
      expect(validateNumeric('123', 'Amount')).toEqual({ isValid: true });
      expect(validateNumeric('123.45', 'Amount')).toEqual({ isValid: true });
    });

    test('should reject non-numeric values', () => {
      expect(validateNumeric('', 'Amount')).toEqual({ isValid: false, error: 'Amount is required' });
      expect(validateNumeric('abc', 'Amount')).toEqual({ isValid: false, error: 'Amount must be a valid number' });
    });
  });

  describe('validateGSTNumber', () => {
    test('should validate correct GST numbers', () => {
      expect(validateGSTNumber('29ABCDE1234F1Z5')).toEqual({ isValid: true });
    });

    test('should reject invalid GST numbers', () => {
      expect(validateGSTNumber('')).toEqual({ isValid: false, error: 'GST number is required' });
      expect(validateGSTNumber('12345')).toEqual({ isValid: false, error: 'GST number must be 15 characters' });
      expect(validateGSTNumber('INVALIDGSTNUMBER')).toEqual({ isValid: false, error: 'GST number must be 15 characters' });
    });
  });

  describe('validateAadharNumber', () => {
    test('should validate correct Aadhar numbers', () => {
      expect(validateAadharNumber('234567890123')).toEqual({ isValid: true });
      expect(validateAadharNumber('2345 6789 0123')).toEqual({ isValid: true });
    });

    test('should reject invalid Aadhar numbers', () => {
      expect(validateAadharNumber('')).toEqual({ isValid: false, error: 'Aadhar number is required' });
      expect(validateAadharNumber('12345')).toEqual({ isValid: false, error: 'Aadhar number must be 12 digits' });
      expect(validateAadharNumber('abcd12345678')).toEqual({ isValid: false, error: 'Aadhar number must contain only digits' });
      expect(validateAadharNumber('012345678901')).toEqual({ isValid: false, error: 'Invalid Aadhar number' });
      expect(validateAadharNumber('112345678901')).toEqual({ isValid: false, error: 'Invalid Aadhar number' });
    });
  });

  describe('validatePANNumber', () => {
    test('should validate correct PAN numbers', () => {
      expect(validatePANNumber('ABCDE1234F')).toEqual({ isValid: true });
    });

    test('should reject invalid PAN numbers', () => {
      expect(validatePANNumber('')).toEqual({ isValid: false, error: 'PAN number is required' });
      expect(validatePANNumber('12345')).toEqual({ isValid: false, error: 'PAN number must be 10 characters' });
      expect(validatePANNumber('INVALIDPAN')).toEqual({ isValid: false, error: 'Invalid PAN number format' });
    });
  });

  describe('validateIFSCCode', () => {
    test('should validate correct IFSC codes', () => {
      expect(validateIFSCCode('SBIN0001234')).toEqual({ isValid: true });
    });

    test('should reject invalid IFSC codes', () => {
      expect(validateIFSCCode('')).toEqual({ isValid: false, error: 'IFSC code is required' });
      expect(validateIFSCCode('12345')).toEqual({ isValid: false, error: 'IFSC code must be 11 characters' });
      expect(validateIFSCCode('INVALIDIFSC')).toEqual({ isValid: false, error: 'Invalid IFSC code format' });
    });
  });

  describe('validateFileSize', () => {
    test('should validate correct file sizes', () => {
      expect(validateFileSize(1024 * 1024)).toEqual({ isValid: true }); // 1MB
      expect(validateFileSize(1024 * 1024 * 3)).toEqual({ isValid: true }); // 3MB
    });

    test('should reject oversized files', () => {
      expect(validateFileSize(1024 * 1024 * 6)).toEqual({ isValid: false, error: 'File size must be less than 5MB' });
      expect(validateFileSize(1024 * 1024 * 11, 10)).toEqual({ isValid: false, error: 'File size must be less than 10MB' });
    });
  });

  describe('validateFileType', () => {
    test('should validate correct file types', () => {
      expect(validateFileType('document.pdf', ['pdf', 'doc'])).toEqual({ isValid: true });
      expect(validateFileType('image.jpg', ['jpg', 'png'])).toEqual({ isValid: true });
    });

    test('should reject invalid file types', () => {
      expect(validateFileType('document', ['pdf'])).toEqual({ isValid: false, error: 'File type must be one of: pdf' });
      expect(validateFileType('document.txt', ['pdf', 'doc'])).toEqual({ isValid: false, error: 'File type must be one of: pdf, doc' });
    });
  });

  describe('validateDate', () => {
    test('should validate correct dates', () => {
      expect(validateDate('2024-01-01')).toEqual({ isValid: true });
      expect(validateDate(new Date())).toEqual({ isValid: true });
    });

    test('should reject invalid dates', () => {
      expect(validateDate('')).toEqual({ isValid: false, error: 'Date is required' });
      expect(validateDate('invalid-date')).toEqual({ isValid: false, error: 'Date is not a valid date' });
    });
  });

  describe('validateFutureDate', () => {
    test('should validate future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(validateFutureDate(futureDate)).toEqual({ isValid: true });
    });

    test('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(validateFutureDate(pastDate)).toEqual({ isValid: false, error: 'Date must be in the future' });
    });
  });

  describe('validateAge', () => {
    test('should validate correct ages', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      expect(validateAge(birthDate)).toEqual({ isValid: true });
    });

    test('should reject invalid ages', () => {
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 10);
      expect(validateAge(tooYoung)).toEqual({ isValid: false, error: 'Age must be at least 18 years' });

      const tooOld = new Date();
      tooOld.setFullYear(tooOld.getFullYear() - 150);
      expect(validateAge(tooOld)).toEqual({ isValid: false, error: 'Age cannot be more than 120 years' });
    });
  });

  describe('validateURL', () => {
    test('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toEqual({ isValid: true });
      expect(validateURL('http://test.org')).toEqual({ isValid: true });
    });

    test('should reject invalid URLs', () => {
      expect(validateURL('')).toEqual({ isValid: false, error: 'URL is required' });
      expect(validateURL('invalid-url')).toEqual({ isValid: false, error: 'Invalid URL format' });
    });
  });

  describe('getFullIndianPhoneNumber', () => {
    test('should add country code to phone numbers', () => {
      expect(getFullIndianPhoneNumber('9876543210')).toBe('+919876543210');
      expect(getFullIndianPhoneNumber('+919876543210')).toBe('+919876543210');
      expect(getFullIndianPhoneNumber('919876543210')).toBe('+919876543210');
    });
  });

  describe('cleanPhoneNumber', () => {
    test('should clean phone numbers', () => {
      expect(cleanPhoneNumber('+91-987-654-3210')).toBe('919876543210');
      expect(cleanPhoneNumber('(+91) 987 654 3210')).toBe('919876543210');
    });
  });

  describe('createDebouncedValidator', () => {
    test('should create debounced validator', () => {
      const validator = (value: string) => ({ isValid: value.length > 5, error: value.length <= 5 ? 'Too short' : undefined });
      const debouncedValidator = createDebouncedValidator(validator, 50);
      
      // Test that the function is created without errors
      expect(typeof debouncedValidator).toBe('function');
      
      // We can't easily test the async behavior in a unit test without more complex setup
      // So we'll just verify the function creates correctly
    });
  });
});