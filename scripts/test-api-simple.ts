#!/usr/bin/env npx tsx

/**
 * Simple API Integration Test
 * Tests the key integration points without React Native dependencies
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'auth_required';
  statusCode?: number;
  message: string;
}

class SimpleAPITester {
  private results: TestResult[] = [];

  async testAPIIntegration() {
    console.log('🧪 Testing API Integration Points...\n');

    // Test health endpoint
    await this.testEndpoint('GET', '/health', 'Health Check');

    // Test API info
    await this.testEndpoint('GET', '/api', 'API Information');

    // Test auth registration
    await this.testEndpoint('POST', '/api/v4/auth/register', 'Auth Registration', {
      name: 'Test User',
      email: 'test@aptly.com',
      password: 'test123',
      phoneNumber: '+919876543210',
      societyCode: 'APT001'
    });

    // Test visitors endpoint (should require auth)
    await this.testEndpoint('GET', '/api/v4/visitors', 'Visitors List');

    // Test user profile (should require auth)  
    await this.testEndpoint('GET', '/api/v4/user/profile', 'User Profile');

    // Test home dashboard (should require auth or not exist)
    await this.testEndpoint('GET', '/api/v4/home', 'Home Dashboard');

    // Test notices
    await this.testEndpoint('GET', '/api/notices', 'Notices List');

    this.printResults();
  }

  private async testEndpoint(method: string, endpoint: string, name: string, data?: any) {
    try {
      console.log(`🔍 Testing ${name}...`);
      
      let response;
      const url = `${BASE_URL}${endpoint}`;
      
      if (method === 'GET') {
        response = await axios.get(url, {
          timeout: 10000,
          validateStatus: (status) => status < 500,
        });
      } else if (method === 'POST') {
        response = await axios.post(url, data, {
          timeout: 10000,
          validateStatus: (status) => status < 500,
        });
      }

      const status = response.status < 300 ? 'success' : 
                    response.status === 401 ? 'auth_required' : 'error';
      
      const message = response.status < 300 ? 'Working correctly' :
                     response.status === 401 ? 'Requires authentication (expected)' :
                     response.status === 404 ? 'Endpoint not implemented' :
                     `Error: ${response.status} - ${response.statusText}`;

      this.results.push({
        endpoint,
        method,
        status,
        statusCode: response.status,
        message,
      });

      const icon = status === 'success' ? '✅' : 
                   status === 'auth_required' ? '🔐' : '❌';
      
      console.log(`   ${icon} ${message} (${response.status})`);

    } catch (error: any) {
      this.results.push({
        endpoint,
        method,
        status: 'error',
        message: `Connection failed: ${error.message}`,
      });

      console.log(`   ❌ Connection failed: ${error.message}`);
    }

    console.log('');
  }

  private printResults() {
    console.log('📊 API Integration Test Results Summary:\n');
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const authRequiredCount = this.results.filter(r => r.status === 'auth_required').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Working Endpoints: ${successCount}`);
    console.log(`🔐 Auth Required (Expected): ${authRequiredCount}`);
    console.log(`❌ Failed/Missing: ${errorCount}`);
    console.log('');

    console.log('📋 Endpoint Status:');
    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'auth_required' ? '🔐' : '❌';
      console.log(`   ${icon} ${result.method} ${result.endpoint} → ${result.statusCode || 'Error'}`);
    });

    console.log('\n🔍 Integration Analysis:');
    
    const workingEndpoints = this.results.filter(r => r.status === 'success' || r.status === 'auth_required');
    const totalEndpoints = this.results.length;
    const integrationScore = Math.round((workingEndpoints.length / totalEndpoints) * 100);
    
    console.log(`   Integration Score: ${integrationScore}%`);
    console.log(`   Server Status: ${this.results.some(r => r.status === 'success') ? 'Online' : 'Offline'}`);
    console.log(`   Auth System: ${this.results.some(r => r.status === 'auth_required') ? 'Working' : 'Unknown'}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (integrationScore > 80) {
      console.log('   ✅ API integration is working well');
      console.log('   ✅ Services can connect to available endpoints');
      console.log('   ✅ Authentication system is protecting endpoints correctly');
    } else if (integrationScore > 50) {
      console.log('   🟡 API integration is partially working');
      console.log('   🟡 Some endpoints need implementation or fixing');
      console.log('   🟡 Continue using hybrid approach with mock data');
    } else {
      console.log('   ❌ API integration needs attention');
      console.log('   ❌ Most endpoints are not available');
      console.log('   ❌ Rely heavily on mock data for development');
    }

    console.log('\n🚀 Next Steps:');
    console.log('   1. Use services with hybrid real/mock data approach');
    console.log('   2. Connect UI screens to integrated services');
    console.log('   3. Implement proper loading states and error handling');
    console.log('   4. Test end-to-end user flows');
  }
}

// Main execution
async function main() {
  const tester = new SimpleAPITester();
  await tester.testAPIIntegration();
}

if (require.main === module) {
  main().catch(console.error);
}

export { SimpleAPITester };