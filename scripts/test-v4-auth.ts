#!/usr/bin/env npx tsx

/**
 * V4 Authentication Test Script
 * Tests the actual authentication flow with localhost:3000
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const timeout = 10000;

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'needs_auth';
  statusCode?: number;
  data?: any;
  error?: string;
}

class V4AuthTester {
  private results: TestResult[] = [];

  async testAuthentication() {
    console.log('🔐 Testing V4 Authentication Flow...\n');

    // Test 1: Register endpoint
    await this.testRegister();

    // Test 2: Login endpoint
    await this.testLogin();

    // Test 3: User profile endpoint
    await this.testUserProfile();

    // Test 4: Refresh token endpoint
    await this.testRefreshToken();

    // Test 5: Logout endpoint
    await this.testLogout();

    this.printResults();
  }

  private async testRegister() {
    console.log('📝 Testing Registration...');
    
    const testData = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      phoneNumber: '+911234567890',
      societyCode: 'TESTCODE'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/v4/auth/register`, testData, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      this.results.push({
        endpoint: '/api/v4/auth/register',
        method: 'POST',
        status: response.status < 400 ? 'success' : 'error',
        statusCode: response.status,
        data: this.sanitizeData(response.data),
      });

      console.log(`   Status: ${response.status} - ${response.statusText}`);
      if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      this.results.push({
        endpoint: '/api/v4/auth/register',
        method: 'POST',
        status: 'error',
        error: error.message,
      });
      console.log(`   Error: ${error.message}`);
    }

    console.log('');
  }

  private async testLogin() {
    console.log('🔑 Testing Login...');
    
    // Test with email/password
    const testData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/v4/auth/login`, testData, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      this.results.push({
        endpoint: '/api/v4/auth/login',
        method: 'POST',
        status: response.status < 400 ? 'success' : 'error',
        statusCode: response.status,
        data: this.sanitizeData(response.data),
      });

      console.log(`   Status: ${response.status} - ${response.statusText}`);
      if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      this.results.push({
        endpoint: '/api/v4/auth/login',
        method: 'POST',
        status: 'error',
        error: error.message,
      });
      console.log(`   Error: ${error.message}`);
    }

    console.log('');

    // Test with phone number (alternative)
    console.log('📱 Testing Phone Login...');
    
    const phoneData = {
      phoneNumber: '+911234567890',
      countryCode: 'IN'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/v4/auth/login`, phoneData, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      console.log(`   Phone Login Status: ${response.status} - ${response.statusText}`);
      if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      console.log(`   Phone Login Error: ${error.message}`);
    }

    console.log('');
  }

  private async testUserProfile() {
    console.log('👤 Testing User Profile...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/v4/user/profile`, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      this.results.push({
        endpoint: '/api/v4/user/profile',
        method: 'GET',
        status: response.status === 401 ? 'needs_auth' : response.status < 400 ? 'success' : 'error',
        statusCode: response.status,
        data: this.sanitizeData(response.data),
      });

      console.log(`   Status: ${response.status} - ${response.statusText}`);
      if (response.status === 401) {
        console.log('   ✅ Correctly requires authentication');
      } else if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      this.results.push({
        endpoint: '/api/v4/user/profile',
        method: 'GET',
        status: 'error',
        error: error.message,
      });
      console.log(`   Error: ${error.message}`);
    }

    console.log('');
  }

  private async testRefreshToken() {
    console.log('🔄 Testing Token Refresh...');
    
    const testData = {
      refreshToken: 'fake-refresh-token'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/v4/auth/refresh`, testData, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      this.results.push({
        endpoint: '/api/v4/auth/refresh',
        method: 'POST',
        status: response.status === 401 ? 'needs_auth' : response.status < 400 ? 'success' : 'error',
        statusCode: response.status,
        data: this.sanitizeData(response.data),
      });

      console.log(`   Status: ${response.status} - ${response.statusText}`);
      if (response.status === 401) {
        console.log('   ✅ Correctly requires valid refresh token');
      } else if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      this.results.push({
        endpoint: '/api/v4/auth/refresh',
        method: 'POST',
        status: 'error',
        error: error.message,
      });
      console.log(`   Error: ${error.message}`);
    }

    console.log('');
  }

  private async testLogout() {
    console.log('🚪 Testing Logout...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/v4/auth/logout`, {}, {
        timeout,
        validateStatus: (status) => status < 500,
      });

      this.results.push({
        endpoint: '/api/v4/auth/logout',
        method: 'POST',
        status: response.status === 401 ? 'needs_auth' : response.status < 400 ? 'success' : 'error',
        statusCode: response.status,
        data: this.sanitizeData(response.data),
      });

      console.log(`   Status: ${response.status} - ${response.statusText}`);
      if (response.status === 401) {
        console.log('   ✅ Correctly requires authentication');
      } else if (response.data) {
        console.log(`   Response: ${JSON.stringify(response.data).slice(0, 200)}...`);
      }

    } catch (error) {
      this.results.push({
        endpoint: '/api/v4/auth/logout',
        method: 'POST',
        status: 'error',
        error: error.message,
      });
      console.log(`   Error: ${error.message}`);
    }

    console.log('');
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    const str = JSON.stringify(data);
    if (str.length > 500) {
      return JSON.parse(str.substring(0, 500) + '...(truncated)');
    }
    return data;
  }

  private printResults() {
    console.log('📊 Test Results Summary:\n');
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const needsAuthCount = this.results.filter(r => r.status === 'needs_auth').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Success: ${successCount}`);
    console.log(`🔐 Needs Auth (Expected): ${needsAuthCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('');

    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'needs_auth' ? '🔐' : '❌';
      console.log(`${icon} ${result.method} ${result.endpoint} → ${result.statusCode || 'Error'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n📋 Integration Recommendations:');
    console.log('1. Update auth service to handle API response structures');
    console.log('2. Implement proper token storage and management');
    console.log('3. Handle authentication state properly in the app');
    console.log('4. Test actual login flow with valid credentials');
  }
}

// Main execution
async function main() {
  const tester = new V4AuthTester();
  await tester.testAuthentication();
}

if (require.main === module) {
  main().catch(console.error);
}

export { V4AuthTester };