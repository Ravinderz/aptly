/**
 * Backend Connection Test Script
 * Tests the connection to the local backend running on localhost:3000
 */

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { apiClient } from '../services/api.client';

/**
 * Test backend connection and available endpoints
 */
async function testBackendConnection() {
  console.log('🚀 Starting Backend Connection Test...');
  console.log(`📡 API Base URL: ${API_CONFIG.BASE_URL}`);
  
  const results: Record<string, any> = {};

  try {
    // Test 1: Basic health check
    console.log('\n1️⃣ Testing basic connectivity...');
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
      results.health = {
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? await response.json() : null,
      };
      console.log(`✅ Health check: ${response.status} ${response.statusText}`);
    } catch (error) {
      results.health = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.log(`❌ Health check failed: ${error}`);
    }

    // Test 2: API info endpoint
    console.log('\n2️⃣ Testing API info endpoint...');
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api`);
      results.apiInfo = {
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? await response.json() : null,
      };
      console.log(`✅ API info: ${response.status} ${response.statusText}`);
    } catch (error) {
      results.apiInfo = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.log(`❌ API info failed: ${error}`);
    }

    // Test 3: Test specific endpoints
    console.log('\n3️⃣ Testing specific API endpoints...');
    
    const endpointsToTest = [
      { name: 'Auth Login', url: API_ENDPOINTS.AUTH.LOGIN, method: 'POST' },
      { name: 'Societies List', url: API_ENDPOINTS.SOCIETIES.LIST, method: 'GET' },
      { name: 'Visitors List', url: API_ENDPOINTS.VISITORS.LIST, method: 'GET' },
      { name: 'Admin Dashboard', url: API_ENDPOINTS.ADMIN.DASHBOARD, method: 'GET' },
      { name: 'Manager Dashboard', url: API_ENDPOINTS.MANAGER.DASHBOARD, method: 'GET' },
      { name: 'Security Dashboard', url: API_ENDPOINTS.SECURITY.DASHBOARD, method: 'GET' },
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        results[endpoint.name] = {
          status: response.status,
          statusText: response.statusText,
          available: response.status !== 404,
        };
        
        const statusIcon = response.status === 404 ? '⚠️' : 
                         response.status >= 400 ? '❌' : '✅';
        console.log(`${statusIcon} ${endpoint.name}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        results[endpoint.name] = { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        console.log(`❌ ${endpoint.name} failed: ${error}`);
      }
    }

    // Test 4: Test API client
    console.log('\n4️⃣ Testing API client integration...');
    try {
      // This will likely fail with 401/403 but should show the client is working
      const response = await apiClient.get('/api/test');
      results.apiClient = { success: true, data: response };
      console.log('✅ API client working');
    } catch (error: any) {
      // Expected to fail with authentication, but shows client is working
      if (error.statusCode === 401 || error.statusCode === 403) {
        results.apiClient = { success: true, note: 'Authentication required (expected)' };
        console.log('✅ API client working (authentication required)');
      } else {
        results.apiClient = { error: error.message };
        console.log(`❌ API client failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(JSON.stringify(results, null, 2));
  
  // Print recommendations
  console.log('\n💡 Recommendations:');
  console.log('==================');
  
  if (results.health?.status === 200) {
    console.log('✅ Backend is running and accessible');
  } else {
    console.log('❌ Backend health check failed - ensure your backend is running on localhost:3000');
  }
  
  const availableEndpoints = Object.entries(results)
    .filter(([key, value]: [string, any]) => 
      value.status && value.status !== 404 && value.status < 500
    ).length;
    
  console.log(`📈 Available endpoints: ${availableEndpoints} out of ${endpointsToTest.length} tested`);
  
  if (results.apiClient?.success) {
    console.log('✅ API client integration is working correctly');
  } else {
    console.log('❌ API client needs configuration or backend adjustments');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Ensure your backend implements the expected API endpoints');
  console.log('2. Configure authentication endpoints for mobile app login');
  console.log('3. Test the mobile app with real data from your backend');
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBackendConnection()
    .then(() => {
      console.log('\n✅ Backend connection test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Backend connection test failed:', error);
      process.exit(1);
    });
}

export { testBackendConnection };