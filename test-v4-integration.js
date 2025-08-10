/**
 * Test V4 API Integration
 * Simple script to verify V4 backend integration
 */

const BASE_URL = 'http://localhost:3000';

async function testV4Integration() {
  console.log('🧪 Testing V4 API Integration...');
  console.log(`📡 Backend URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'System Health',
      test: async () => {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        return { success: response.ok, data };
      }
    },
    {
      name: 'API Information',
      test: async () => {
        const response = await fetch(`${BASE_URL}/api`);
        const data = await response.json();
        return { success: response.ok, data: { version: data.version, features: data.features.length } };
      }
    },
    {
      name: 'Notices (with auth)',
      test: async () => {
        const response = await fetch(`${BASE_URL}/api/notices`);
        if (response.status === 401) {
          return { success: true, data: { message: 'Endpoint available (requires auth)' }, requiresAuth: true };
        }
        const data = await response.json();
        return { success: response.ok, data };
      }
    },
    {
      name: 'V4 Visitors (with auth)',
      test: async () => {
        const response = await fetch(`${BASE_URL}/api/v4/visitors`);
        if (response.status === 401) {
          return { success: true, data: { message: 'Endpoint available (requires auth)' }, requiresAuth: true };
        }
        const data = await response.json();
        return { success: response.ok, data };
      }
    },
    {
      name: 'V4 Societies (with auth)',
      test: async () => {
        const response = await fetch(`${BASE_URL}/api/v4/societies`);
        if (response.status === 401) {
          return { success: true, data: { message: 'Endpoint available (requires auth)' }, requiresAuth: true };
        } else if (response.status === 404) {
          return { success: false, data: { message: 'Endpoint not implemented' } };
        }
        const data = await response.json();
        return { success: response.ok, data };
      }
    }
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    try {
      console.log(`🔍 Testing ${name}...`);
      const result = await test();
      
      if (result.success) {
        if (result.requiresAuth) {
          console.log(`🔐 ${name}: Available (requires authentication)`);
        } else {
          console.log(`✅ ${name}: Working`);
        }
      } else {
        console.log(`❌ ${name}: Failed`);
      }
      
      results.push({
        name,
        status: result.success ? 'success' : 'failed',
        requiresAuth: result.requiresAuth || false,
        data: result.data
      });
      
    } catch (error) {
      console.log(`💥 ${name}: Error - ${error.message}`);
      results.push({
        name,
        status: 'error',
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n📊 Integration Test Summary:');
  console.log('============================');
  
  const working = results.filter(r => r.status === 'success' && !r.requiresAuth).length;
  const requireAuth = results.filter(r => r.requiresAuth).length;
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
  
  console.log(`✅ Working endpoints: ${working}`);
  console.log(`🔐 Endpoints requiring auth: ${requireAuth}`);
  console.log(`❌ Failed endpoints: ${failed}`);
  
  console.log('\n🚀 Integration Status:');
  if (working >= 2) {
    console.log('✅ V4 Backend integration is working!');
    console.log('📱 Mobile app can now connect to your backend');
    console.log('🔐 Most endpoints require authentication - implement auth first');
  } else {
    console.log('⚠️ Limited backend functionality available');
    console.log('📋 Check which endpoints need to be implemented');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Implement authentication endpoints if needed');
  console.log('2. Test mobile app with /dev-api-test screen');
  console.log('3. Use mock data fallback for unimplemented endpoints');
  console.log('4. Gradually implement more V4 endpoints as needed');

  return results;
}

testV4Integration()
  .then(() => {
    console.log('\n✅ V4 Integration test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  });