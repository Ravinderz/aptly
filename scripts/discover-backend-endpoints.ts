/**
 * Backend Endpoint Discovery Script
 * Discovers which endpoints are actually implemented in the backend
 */

import { API_CONFIG } from '../config/api.config';

const BASE_URL = API_CONFIG.BASE_URL;

async function testEndpoint(method: string, endpoint: string, requireAuth: boolean = false): Promise<any> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      headers['Authorization'] = 'Bearer test-token';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
    });

    return {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      available: response.status !== 404,
      requiresAuth: response.status === 401,
      data: response.status < 400 ? await response.json() : null,
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      available: false,
    };
  }
}

async function discoverEndpoints() {
  console.log('🔍 Discovering Backend Endpoints...');
  console.log(`📡 Backend URL: ${BASE_URL}\n`);

  const endpointsToTest = [
    // System endpoints
    { method: 'GET', endpoint: '/health', category: 'System' },
    { method: 'GET', endpoint: '/api', category: 'System' },
    
    // Auth endpoints
    { method: 'POST', endpoint: '/auth/login', category: 'Auth' },
    { method: 'POST', endpoint: '/auth/register', category: 'Auth' },
    
    // User endpoints (V1)
    { method: 'GET', endpoint: '/api/users/123', category: 'Users V1' },
    { method: 'POST', endpoint: '/api/users', category: 'Users V1' },
    
    // User endpoints (V2)
    { method: 'GET', endpoint: '/api/v2/users/123', category: 'Users V2' },
    { method: 'POST', endpoint: '/api/v2/users', category: 'Users V2' },
    
    // Visitor endpoints (V2)
    { method: 'GET', endpoint: '/api/v2/visitors', category: 'Visitors V2' },
    { method: 'GET', endpoint: '/api/v2/visitors/today', category: 'Visitors V2' },
    { method: 'GET', endpoint: '/api/v2/visitors/analytics', category: 'Visitors V2' },
    
    // Visitor endpoints (V3)
    { method: 'POST', endpoint: '/api/v3/visitors', category: 'Visitors V3' },
    { method: 'GET', endpoint: '/api/v3/visitors/analytics', category: 'Visitors V3' },
    
    // Notice endpoints
    { method: 'GET', endpoint: '/api/notices', category: 'Notices' },
    { method: 'GET', endpoint: '/api/notices/all', category: 'Notices' },
    { method: 'POST', endpoint: '/api/notices', category: 'Notices' },
    
    // Notification endpoints (V1)
    { method: 'POST', endpoint: '/api/notifications/send', category: 'Notifications V1' },
    { method: 'POST', endpoint: '/api/notifications/send-bulk', category: 'Notifications V1' },
    
    // Notification endpoints (V2)
    { method: 'POST', endpoint: '/api/v2/notifications/send', category: 'Notifications V2' },
    
    // Notification endpoints (V3)
    { method: 'POST', endpoint: '/api/v3/notifications/send-notice', category: 'Notifications V3' },
    { method: 'GET', endpoint: '/api/v3/notifications/analytics', category: 'Notifications V3' },
    
    // Admin endpoints (future)
    { method: 'GET', endpoint: '/api/admin/dashboard', category: 'Admin' },
    { method: 'GET', endpoint: '/api/admin/users', category: 'Admin' },
    
    // Manager endpoints (future)
    { method: 'GET', endpoint: '/api/manager/dashboard', category: 'Manager' },
    { method: 'GET', endpoint: '/api/manager/reports', category: 'Manager' },
    
    // Security endpoints (future)
    { method: 'GET', endpoint: '/api/security/dashboard', category: 'Security' },
    { method: 'GET', endpoint: '/api/security/vehicles', category: 'Security' },
  ];

  const results: Record<string, any[]> = {};
  
  for (const { method, endpoint, category } of endpointsToTest) {
    const result = await testEndpoint(method, endpoint);
    
    if (!results[category]) {
      results[category] = [];
    }
    results[category].push(result);
    
    const statusIcon = result.status === 404 ? '❌' : 
                      result.status >= 400 ? '⚠️' : '✅';
    console.log(`${statusIcon} ${method} ${endpoint} → ${result.status} ${result.statusText || ''}`);
  }

  console.log('\n📊 Summary by Category:');
  console.log('=========================\n');

  for (const [category, categoryResults] of Object.entries(results)) {
    const available = categoryResults.filter(r => r.available).length;
    const total = categoryResults.length;
    
    console.log(`${category}: ${available}/${total} endpoints available`);
    
    // Show working endpoints
    const working = categoryResults.filter(r => r.status < 300);
    if (working.length > 0) {
      console.log('  ✅ Working:');
      working.forEach(r => {
        console.log(`     ${r.method} ${r.endpoint} (${r.status})`);
      });
    }
    
    // Show endpoints requiring auth
    const requireAuth = categoryResults.filter(r => r.requiresAuth);
    if (requireAuth.length > 0) {
      console.log('  🔐 Requires Auth:');
      requireAuth.forEach(r => {
        console.log(`     ${r.method} ${r.endpoint} (401)`);
      });
    }
    
    // Show not found endpoints
    const notFound = categoryResults.filter(r => r.status === 404);
    if (notFound.length > 0) {
      console.log('  ❌ Not Found:');
      notFound.forEach(r => {
        console.log(`     ${r.method} ${r.endpoint}`);
      });
    }
    
    console.log('');
  }

  console.log('💡 Recommendations:');
  console.log('===================');
  
  const workingEndpoints = Object.values(results).flat().filter(r => r.status < 400);
  const authEndpoints = Object.values(results).flat().filter(r => r.requiresAuth);
  const missingEndpoints = Object.values(results).flat().filter(r => r.status === 404);
  
  console.log(`✅ Working endpoints: ${workingEndpoints.length}`);
  console.log(`🔐 Endpoints requiring auth: ${authEndpoints.length}`);
  console.log(`❌ Missing endpoints: ${missingEndpoints.length}`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n🚀 You can immediately use these endpoints in your mobile app:');
    workingEndpoints.forEach(r => {
      console.log(`   ${r.method} ${r.endpoint}`);
    });
  }
  
  if (authEndpoints.length > 0) {
    console.log('\n🔐 These endpoints need authentication implementation:');
    authEndpoints.slice(0, 5).forEach(r => {
      console.log(`   ${r.method} ${r.endpoint}`);
    });
    if (authEndpoints.length > 5) {
      console.log(`   ... and ${authEndpoints.length - 5} more`);
    }
  }
  
  return results;
}

// Run if executed directly
if (require.main === module) {
  discoverEndpoints()
    .then(() => {
      console.log('\n✅ Endpoint discovery completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Endpoint discovery failed:', error);
      process.exit(1);
    });
}

export { discoverEndpoints };