/**
 * Simple backend endpoint tester
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      available: response.status !== 404,
      requiresAuth: response.status === 401,
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'ERROR',
      error: error.message,
      available: false,
    };
  }
}

async function main() {
  console.log('🔍 Testing V4 Backend Endpoints...');
  console.log(`📡 Backend URL: ${BASE_URL}\n`);

  const endpoints = [
    // System
    ['GET', '/health'],
    ['GET', '/api'],
    // V4 Auth
    ['POST', '/api/v4/auth/login'],
    ['POST', '/api/v4/auth/register'],
    // V4 Core
    ['GET', '/api/v4/societies'],
    ['GET', '/api/v4/visitors'],
    ['GET', '/api/v4/home'],
    ['GET', '/api/v4/home/stats'],
    ['GET', '/api/v4/services/maintenance'],
    ['GET', '/api/v4/services/billing'],
    // Notices
    ['GET', '/api/notices'],
    ['GET', '/api/notices/all'],
    ['GET', '/api/notices/statistics'],
  ];

  const results = [];
  
  for (const [method, endpoint] of endpoints) {
    const result = await testEndpoint(method, endpoint);
    results.push(result);
    
    const statusIcon = result.status === 404 ? '❌' : 
                      result.status >= 400 ? '⚠️' : '✅';
    console.log(`${statusIcon} ${method} ${endpoint} → ${result.status} ${result.statusText || result.error || ''}`);
  }

  console.log('\n📊 Summary:');
  console.log('===========');
  
  const working = results.filter(r => r.status < 300);
  const authRequired = results.filter(r => r.requiresAuth);
  const notFound = results.filter(r => r.status === 404);
  
  console.log(`✅ Working: ${working.length}`);
  console.log(`🔐 Auth Required: ${authRequired.length}`);
  console.log(`❌ Not Found: ${notFound.length}`);
  
  if (working.length > 0) {
    console.log('\n🚀 Ready to use:');
    working.forEach(r => console.log(`   ${r.method} ${r.endpoint}`));
  }
}

main().catch(console.error);