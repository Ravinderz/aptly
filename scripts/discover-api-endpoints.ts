#!/usr/bin/env npx tsx

/**
 * API Endpoint Discovery Script
 * Discovers and documents all available API endpoints from localhost:3000
 */

import axios from 'axios';

interface EndpointInfo {
  path: string;
  method: string;
  description?: string;
  params?: string[];
  queryParams?: string[];
  body?: Record<string, any>;
  responses?: Record<number, any>;
}

interface APIDiscovery {
  baseUrl: string;
  endpoints: EndpointInfo[];
  health: boolean;
  timestamp: string;
}

class APIEndpointDiscoverer {
  private baseUrl = 'http://localhost:3000';
  private timeout = 10000;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async discoverEndpoints(): Promise<APIDiscovery> {
    console.log('🔍 Starting API endpoint discovery...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    
    const discovery: APIDiscovery = {
      baseUrl: this.baseUrl,
      endpoints: [],
      health: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // First check if server is running
      await this.checkServerHealth();
      discovery.health = true;
      console.log('✅ Server is running and accessible');

      // Try to discover endpoints through common patterns
      await this.discoverCommonEndpoints(discovery);
      
      // Try to discover API documentation endpoints
      await this.discoverDocumentationEndpoints(discovery);

    } catch (error) {
      console.error('❌ Failed to connect to server:', error.message);
      discovery.health = false;
    }

    return discovery;
  }

  private async checkServerHealth(): Promise<void> {
    const healthEndpoints = ['/health', '/api/health', '/ping', '/status', '/'];
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          timeout: this.timeout,
        });
        console.log(`✅ Health check passed: ${endpoint} (${response.status})`);
        return;
      } catch (error) {
        console.log(`⚠️  Health check failed: ${endpoint}`);
      }
    }
    
    throw new Error('Server health check failed on all endpoints');
  }

  private async discoverCommonEndpoints(discovery: APIDiscovery): Promise<void> {
    console.log('\n🔍 Discovering common API endpoints...');

    // Common API endpoint patterns to test
    const commonEndpoints = [
      // Health and info
      { path: '/health', method: 'GET' },
      { path: '/api', method: 'GET' },
      { path: '/api/v4', method: 'GET' },
      
      // Auth endpoints
      { path: '/api/v4/auth/login', method: 'POST' },
      { path: '/api/v4/auth/register', method: 'POST' },
      { path: '/api/v4/auth/refresh', method: 'POST' },
      { path: '/api/v4/auth/logout', method: 'POST' },
      { path: '/auth/me', method: 'GET' },
      
      // Society endpoints
      { path: '/api/v4/societies', method: 'GET' },
      { path: '/api/v4/societies', method: 'POST' },
      
      // Visitor endpoints
      { path: '/api/v4/visitors', method: 'GET' },
      { path: '/api/v4/visitors', method: 'POST' },
      
      // Home/Dashboard endpoints
      { path: '/api/v4/home', method: 'GET' },
      { path: '/api/v4/home/stats', method: 'GET' },
      
      // Service endpoints
      { path: '/api/v4/services/maintenance', method: 'GET' },
      { path: '/api/v4/services/billing', method: 'GET' },
      
      // Notice endpoints
      { path: '/api/notices', method: 'GET' },
      { path: '/api/notices/all', method: 'GET' },
    ];

    for (const endpoint of commonEndpoints) {
      await this.testEndpoint(endpoint, discovery);
    }
  }

  private async discoverDocumentationEndpoints(discovery: APIDiscovery): Promise<void> {
    console.log('\n🔍 Looking for API documentation endpoints...');

    const docEndpoints = [
      '/docs',
      '/api/docs',
      '/api-docs',
      '/swagger',
      '/openapi',
      '/graphql',
    ];

    for (const endpoint of docEndpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          timeout: this.timeout,
        });
        console.log(`📚 Found documentation: ${endpoint}`);
        discovery.endpoints.push({
          path: endpoint,
          method: 'GET',
          description: 'API Documentation',
        });
      } catch (error) {
        // Silently continue
      }
    }
  }

  private async testEndpoint(endpoint: EndpointInfo, discovery: APIDiscovery): Promise<void> {
    try {
      let response;
      const url = `${this.baseUrl}${endpoint.path}`;

      switch (endpoint.method.toLowerCase()) {
        case 'get':
          response = await axios.get(url, {
            timeout: this.timeout,
            validateStatus: (status) => status < 500, // Accept 4xx errors
          });
          break;
        case 'post':
          response = await axios.post(url, {}, {
            timeout: this.timeout,
            validateStatus: (status) => status < 500,
          });
          break;
        case 'put':
          response = await axios.put(url, {}, {
            timeout: this.timeout,
            validateStatus: (status) => status < 500,
          });
          break;
        case 'delete':
          response = await axios.delete(url, {
            timeout: this.timeout,
            validateStatus: (status) => status < 500,
          });
          break;
        default:
          return;
      }

      const statusIcon = response.status < 300 ? '✅' : 
                        response.status < 400 ? '🔄' : 
                        response.status < 500 ? '⚠️' : '❌';

      console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} → ${response.status}`);

      // Add to discovery results
      discovery.endpoints.push({
        ...endpoint,
        responses: {
          [response.status]: {
            status: response.status,
            statusText: response.statusText,
            data: this.sanitizeResponseData(response.data),
            headers: response.headers,
          },
        },
      });

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.method} ${endpoint.path} → Connection refused`);
      } else if (error.response) {
        const statusIcon = error.response.status < 500 ? '⚠️' : '❌';
        console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} → ${error.response.status}`);
        
        discovery.endpoints.push({
          ...endpoint,
          responses: {
            [error.response.status]: {
              status: error.response.status,
              statusText: error.response.statusText,
              data: this.sanitizeResponseData(error.response.data),
            },
          },
        });
      } else {
        console.log(`❌ ${endpoint.method} ${endpoint.path} → ${error.message}`);
      }
    }
  }

  private sanitizeResponseData(data: any): any {
    if (!data) return data;

    // Limit response data size for readability
    const str = JSON.stringify(data);
    if (str.length > 1000) {
      try {
        return JSON.parse(str.substring(0, 1000) + '...(truncated)');
      } catch {
        return '...(large response truncated)';
      }
    }
    
    return data;
  }

  async generateReport(discovery: APIDiscovery): Promise<string> {
    const workingEndpoints = discovery.endpoints.filter(e => 
      e.responses && Object.keys(e.responses).some(status => parseInt(status) < 400)
    );
    
    const report = `
# API Endpoint Discovery Report

**Base URL:** ${discovery.baseUrl}
**Server Health:** ${discovery.health ? '✅ Healthy' : '❌ Not accessible'}
**Discovery Time:** ${discovery.timestamp}
**Total Endpoints Tested:** ${discovery.endpoints.length}
**Working Endpoints:** ${workingEndpoints.length}

## Available Endpoints

${workingEndpoints.map(endpoint => {
  const status = Object.keys(endpoint.responses || {})[0];
  const response = endpoint.responses?.[status];
  return `### ${endpoint.method} ${endpoint.path}
- **Status:** ${status} ${response?.statusText || ''}
- **Response Preview:** \`\`\`json
${JSON.stringify(response?.data, null, 2)}
\`\`\`
`;
}).join('\n')}

## Failed/Unavailable Endpoints

${discovery.endpoints.filter(e => !workingEndpoints.includes(e)).map(endpoint => {
  const status = Object.keys(endpoint.responses || {})[0] || 'No Response';
  return `- ${endpoint.method} ${endpoint.path} → ${status}`;
}).join('\n')}

## Integration Recommendations

Based on the discovery, update your API configuration:

1. **Working Auth Endpoints:** Update auth service configuration
2. **Working Data Endpoints:** Update visitors, societies, and home services
3. **Missing Endpoints:** Implement fallback or mock data for unavailable endpoints

---
Generated on ${new Date().toLocaleString()}
`;

    return report;
  }
}

// Main execution
async function main() {
  const discoverer = new APIEndpointDiscoverer();
  
  try {
    const discovery = await discoverer.discoverEndpoints();
    const report = await discoverer.generateReport(discovery);
    
    console.log('\n📊 Discovery Results Summary:');
    console.log(`   Server Health: ${discovery.health ? '✅' : '❌'}`);
    console.log(`   Endpoints Tested: ${discovery.endpoints.length}`);
    console.log(`   Working Endpoints: ${discovery.endpoints.filter(e => 
      e.responses && Object.keys(e.responses).some(status => parseInt(status) < 400)
    ).length}`);
    
    // Write report to file
    require('fs').writeFileSync('./api-discovery-report.md', report);
    console.log('\n📝 Full report saved to: api-discovery-report.md');
    
    // Write discovery data as JSON
    require('fs').writeFileSync('./api-discovery-data.json', JSON.stringify(discovery, null, 2));
    console.log('📊 Discovery data saved to: api-discovery-data.json');
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { APIEndpointDiscoverer };