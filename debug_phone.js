const { z } = require('zod');

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
    
    console.log('Input:', val, '-> Cleaned:', cleaned, 'Length:', cleaned.length);
    return cleaned;
  })
  .pipe(
    z
      .string()
      .min(1, 'Phone number is required')
      .min(10, 'Please input 10 digit mobile number')
      .max(10, 'Phone number cannot exceed 10 digits')
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9'),
  );

// Test cases - valid Indian numbers
const testCases = ['9876543210', '8765432109', '7654321098', '6543210987', '+91 9876543210', '919876543210'];

console.log('=== Testing Phone Validation ===');
testCases.forEach(phone => {
  console.log('\n--- Testing:', phone, '---');
  try {
    const result = phoneSchema.parse(phone);
    console.log('✅ Valid -> Result:', result);
  } catch (error) {
    console.log('❌ Invalid -> Error:', error.errors[0].message);
    console.log('Full error object:', JSON.stringify(error.errors, null, 2));
  }
});