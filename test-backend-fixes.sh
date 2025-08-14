#!/bin/bash

# Backend API Integration Test Script
# Tests the fixes for society onboarding authentication issues
# Run this after implementing backend fixes

BASE_URL="http://localhost:3000"
PHONE="+919876543210"
TEST_USER_NAME="Test User"

echo "🧪 Testing Backend API Fixes for Society Onboarding"
echo "=================================================="
echo "Server: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing server health..."
health_response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BASE_URL/health")
http_code=${health_response: -3}

if [ "$http_code" = "200" ]; then
    echo -e "   ${GREEN}✅ Server is healthy${NC}"
else
    echo -e "   ${RED}❌ Server health check failed (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# Test 2: Registration without society code (CRITICAL TEST)
echo "2️⃣  Testing registration WITHOUT society code (Critical Fix)..."
reg_response=$(curl -s -w "%{http_code}" -o /tmp/reg_response.json \
    -X POST "$BASE_URL/api/v4/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\", \"name\": \"$TEST_USER_NAME\"}")
http_code=${reg_response: -3}

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "   ${GREEN}✅ Registration without society code WORKS${NC}"
    echo "   📱 Mobile app can now register users without society code"
elif [ "$http_code" = "400" ]; then
    echo -e "   ${RED}❌ Registration still FAILS - society code still required${NC}"
    echo "   🔧 Backend fix needed: Make societyCode optional in validation"
    echo "   📄 Error details:"
    cat /tmp/reg_response.json | grep -o '"error":"[^"]*"' | head -3
else
    echo -e "   ${YELLOW}⚠️  Unexpected response (HTTP $http_code)${NC}"
fi
echo ""

# Test 3: Registration with empty society code
echo "3️⃣  Testing registration with EMPTY society code..."
reg_empty_response=$(curl -s -w "%{http_code}" -o /tmp/reg_empty_response.json \
    -X POST "$BASE_URL/api/v4/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\", \"name\": \"$TEST_USER_NAME\", \"societyCode\": \"\"}")
http_code=${reg_empty_response: -3}

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "   ${GREEN}✅ Registration with empty society code WORKS${NC}"
elif [ "$http_code" = "400" ]; then
    echo -e "   ${RED}❌ Registration with empty society code FAILS${NC}"
    echo "   🔧 Backend fix needed: Allow empty string for societyCode"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response (HTTP $http_code)${NC}"
fi
echo ""

# Test 4: Registration with valid society code
echo "4️⃣  Testing registration with VALID society code..."
reg_valid_response=$(curl -s -w "%{http_code}" -o /tmp/reg_valid_response.json \
    -X POST "$BASE_URL/api/v4/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\", \"name\": \"$TEST_USER_NAME\", \"societyCode\": \"DEV001\"}")
http_code=${reg_valid_response: -3}

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "   ${GREEN}✅ Registration with valid society code WORKS${NC}"
elif [ "$http_code" = "400" ]; then
    echo -e "   ${YELLOW}⚠️  Registration with DEV001 failed - check society code validation${NC}"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response (HTTP $http_code)${NC}"
fi
echo ""

# Test 5: Login endpoint availability 
echo "5️⃣  Testing LOGIN endpoint availability..."
login_response=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST "$BASE_URL/api/v4/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\": \"$PHONE\", \"otp\": \"123456\"}")
http_code=${login_response: -3}

if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
    echo -e "   ${GREEN}✅ Login endpoint is IMPLEMENTED${NC}"
    echo "   📱 Mobile app can now attempt login"
elif [ "$http_code" = "404" ]; then
    echo -e "   ${RED}❌ Login endpoint NOT FOUND${NC}"
    echo -e "   🔧 Backend fix needed: Implement POST /api/v4/auth/login"
else
    echo -e "   ${YELLOW}⚠️  Login endpoint exists but returned HTTP $http_code${NC}"
fi
echo ""

# Test 6: Societies endpoint
echo "6️⃣  Testing SOCIETIES endpoint..."
societies_response=$(curl -s -w "%{http_code}" -o /tmp/societies_response.json \
    -X GET "$BASE_URL/api/v4/societies")
http_code=${societies_response: -3}

if [ "$http_code" = "200" ]; then
    echo -e "   ${GREEN}✅ Societies endpoint is WORKING${NC}"
elif [ "$http_code" = "401" ]; then
    echo -e "   ${GREEN}✅ Societies endpoint EXISTS (requires auth)${NC}"
elif [ "$http_code" = "404" ]; then
    echo -e "   ${YELLOW}⚠️  Societies endpoint not implemented yet${NC}"
    echo "   📋 Future implementation needed for society search"
else
    echo -e "   ${YELLOW}⚠️  Societies endpoint returned HTTP $http_code${NC}"
fi
echo ""

# Test 7: Home dashboard endpoint
echo "7️⃣  Testing HOME dashboard endpoint..."
home_response=$(curl -s -w "%{http_code}" -o /tmp/home_response.json \
    -X GET "$BASE_URL/api/v4/home")
http_code=${home_response: -3}

if [ "$http_code" = "200" ]; then
    echo -e "   ${GREEN}✅ Home dashboard endpoint is WORKING${NC}"
elif [ "$http_code" = "401" ]; then
    echo -e "   ${GREEN}✅ Home dashboard endpoint EXISTS (requires auth)${NC}"
elif [ "$http_code" = "404" ]; then
    echo -e "   ${YELLOW}⚠️  Home dashboard endpoint not implemented yet${NC}"
    echo "   📋 Future implementation needed for mobile dashboard"
else
    echo -e "   ${YELLOW}⚠️  Home dashboard endpoint returned HTTP $http_code${NC}"
fi
echo ""

# Summary
echo "📊 SUMMARY"
echo "=========="

# Critical fixes status
echo "Critical Fixes Status:"
if grep -q '"success":true' /tmp/reg_response.json 2>/dev/null; then
    echo -e "   ${GREEN}✅ Registration without society code: FIXED${NC}"
    critical_fixed=$((critical_fixed + 1))
else
    echo -e "   ${RED}❌ Registration without society code: NEEDS FIX${NC}"
fi

# Check if login endpoint exists
if [ -f /tmp/login_response.json ] && ! grep -q "not found" /tmp/login_response.json 2>/dev/null; then
    echo -e "   ${GREEN}✅ Login endpoint: IMPLEMENTED${NC}"
    critical_fixed=$((critical_fixed + 1))
else
    echo -e "   ${RED}❌ Login endpoint: NEEDS IMPLEMENTATION${NC}"
fi

echo ""
echo "Next Steps:"
if grep -q '"success":true' /tmp/reg_response.json 2>/dev/null && [ -f /tmp/login_response.json ] && ! grep -q "not found" /tmp/login_response.json 2>/dev/null; then
    echo -e "   ${GREEN}🚀 Ready for mobile app integration testing!${NC}"
    echo "   📱 Mobile app should now be able to:"
    echo "      • Register users without society code"
    echo "      • Attempt OTP verification/login"
    echo "      • Navigate to dashboard (with auth)"
    echo ""
    echo "   🧪 Run mobile app tests:"
    echo "      npm run test -- --testPathPattern=auth"
    echo "      npm run start"
else
    echo -e "   ${YELLOW}⚠️  Still waiting for backend fixes${NC}"
    echo "   🔧 Priority fixes needed:"
    if ! grep -q '"success":true' /tmp/reg_response.json 2>/dev/null; then
        echo "      1. Make societyCode optional in registration validation"
    fi
    if grep -q "not found" /tmp/login_response.json 2>/dev/null; then
        echo "      2. Implement POST /api/v4/auth/login endpoint"
    fi
fi

echo ""
echo "📋 Test artifacts saved in /tmp/:"
ls -la /tmp/*_response.json 2>/dev/null || echo "   No response files saved"

# Cleanup flag
echo ""
echo "🧹 Cleanup test files? (y/n)"
read -r cleanup
if [ "$cleanup" = "y" ]; then
    rm -f /tmp/*_response.json
    echo "   Cleaned up test files"
fi

echo ""
echo "✅ Backend integration test completed!"