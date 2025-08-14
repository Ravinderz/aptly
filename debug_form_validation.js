const { z } = require('zod');

// Recreate the phoneSchema exactly as it is in validation.enhanced.ts
const phoneSchema = z
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
    
    console.log('Transform: Input:', val, '-> Cleaned:', cleaned, 'Length:', cleaned.length);
    return cleaned;
  })
  .pipe(
    z
      .string()
      .min(1, 'Phone number is required')
      .min(10, 'Please input 10 digit mobile number')  // This is the error message!
      .max(10, 'Phone number cannot exceed 10 digits')
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9'),
  );

// Recreate the phoneRegistrationSchema
const phoneRegistrationSchema = z.object({
  phone: phoneSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'Please accept the terms and conditions',
  }),
});

console.log('=== Testing Form Input Scenarios ===');

// Test scenarios that could happen in the form
const formInputs = [
  '987 654 3210',  // Formatted input from form
  '9876543210',    // Plain input
  '98765432',      // Partially typed (8 digits)
  '987654321',     // 9 digits
  '98765432109',   // 11 digits  
  '+91 9876543210', // With country code
  '',              // Empty input
];

formInputs.forEach(input => {
  console.log(`\n--- Testing form input: "${input}" ---`);
  try {
    const result = phoneRegistrationSchema.parse({ 
      phone: input, 
      agreeToTerms: true 
    });
    console.log('✅ Valid -> Result phone:', result.phone);
  } catch (error) {
    console.log('❌ Validation failed. Full error:', JSON.stringify(error.errors, null, 2));
    const phoneError = error.errors?.find(e => e.path.includes('phone'));
    if (phoneError) {
      console.log('❌ Phone validation failed:', phoneError.message);
    }
  }
});