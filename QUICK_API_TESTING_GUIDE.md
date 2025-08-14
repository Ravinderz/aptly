# Quick API Testing Guide

**Server:** localhost:3000  
**Purpose:** Test society onboarding API integration

## Current Issues Found ⚠️

1. **Phone registration requires mandatory 6-character society code**
2. **Login endpoint not implemented** (`POST /api/v4/auth/login` returns 404)
3. **Society management endpoints missing**
4. **Rate limiting too restrictive** (5 auth requests per 15 minutes)

## Quick Test Commands

### ✅ Working Endpoints

```bash
# 1. Server Health Check
curl -X GET http://localhost:3000/health

# Expected: 200 OK with server info
```

```bash
# 2. API Documentation
curl -X GET http://localhost:3000/api

# Expected: 200 OK with comprehensive API docs
```

### ❌ Problem Endpoints

```bash
# 3. Registration without society code (FAILS)
curl -X POST http://localhost:3000/api/v4/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "name": "Test User"
  }'

# Current: 400 Bad Request - "societyCode must be 6 alphanumeric characters"
# Expected: Should allow registration without society code
```

```bash
# 4. Registration with empty society code (FAILS)
curl -X POST http://localhost:3000/api/v4/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210", 
    "name": "Test User",
    "societyCode": ""
  }'

# Current: 400 Bad Request - societyCode validation error
# Expected: Should accept empty society code
```

```bash
# 5. Login endpoint (NOT FOUND)
curl -X POST http://localhost:3000/api/v4/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'

# Current: 404 Not Found
# Expected: Should accept login attempts (even if they fail auth)
```

### ⚠️ Protected Endpoints (Expected 401)

```bash
# 6. User Profile (Requires Auth - Expected)
curl -X GET http://localhost:3000/api/v4/user/profile

# Expected: 401 Unauthorized (correct behavior)
```

```bash
# 7. Societies List (Missing Endpoint)
curl -X GET http://localhost:3000/api/v4/societies

# Current: 404 Not Found
# Expected: 401 Unauthorized (endpoint should exist but require auth)
```

## Success Test Commands

After backend fixes are implemented, these should work:

```bash
# Registration without society code (FIXED)
curl -X POST http://localhost:3000/api/v4/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "name": "Test User"
  }'

# Expected: 200 OK with success response
```

```bash
# Login with test OTP (IMPLEMENTED)
curl -X POST http://localhost:3000/api/v4/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'

# Expected: 200 OK with tokens, or 401 for invalid OTP
```

## Rate Limiting Test

```bash
# Test rate limiting by running this 6 times quickly:
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/v4/auth/register \
    -H "Content-Type: application/json" \
    -d '{"phoneNumber": "+9198765432'$i'0", "name": "Test User"}'
  echo -e "\n"
done

# After 5 requests: "Too many authentication attempts, please try again later"
```

## Mobile App Integration Test

Once backend fixes are ready, test the full mobile app flow:

```bash
# 1. User Registration
curl -X POST http://localhost:3000/api/v4/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "name": "John Doe"
  }'

# Should return: { "success": true, "data": { ... } }

# 2. OTP Verification/Login  
curl -X POST http://localhost:3000/api/v4/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'

# Should return: { "success": true, "data": { "user": {...}, "tokens": {...} } }

# 3. Get User Profile (with token)
TOKEN="your-jwt-token-here"
curl -X GET http://localhost:3000/api/v4/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Should return: { "success": true, "data": { "user": {...} } }
```

## Batch Test Script

Run all tests at once:

```bash
# Make the test script executable and run
chmod +x test-backend-fixes.sh
./test-backend-fixes.sh
```

## Expected Fix Outcomes

### Before Fixes
- ❌ Registration fails without society code
- ❌ Login endpoint returns 404
- ❌ Mobile app cannot authenticate users

### After Fixes  
- ✅ Registration works without society code
- ✅ Login endpoint exists and accepts requests
- ✅ Mobile app can complete authentication flow
- ✅ Users can access protected endpoints with tokens

## Debug Information

### Server Response Headers
```bash
curl -v -X GET http://localhost:3000/health

# Check for:
# - RateLimit-Remaining: Shows remaining requests
# - RateLimit-Reset: Shows when limits reset
# - Content-Type: application/json
```

### Error Response Format
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "msg": "societyCode must be 6 alphanumeric characters",
      "path": "societyCode", 
      "location": "body"
    }
  ]
}
```

### Success Response Format
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "phoneNumber": "+919876543210",
      "societyCode": "ABC123"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

---

**Next Steps:**
1. Share this guide with backend team
2. Backend team implements fixes
3. Run `./test-backend-fixes.sh` to validate
4. Test mobile app integration
5. Deploy and celebrate! 🎉