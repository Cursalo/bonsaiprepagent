#!/usr/bin/env node

/**
 * Health Check Script for Bonsai SAT Prep
 * 
 * This script performs comprehensive health checks for the application
 * including API endpoints, database connectivity, and external services.
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  host: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000,
  timeout: 5000,
  endpoints: [
    '/api/health',
    '/api/auth/session',
    '/api/ai/status'
  ],
  external: {
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL,
    stripe: 'https://api.stripe.com/v1/charges',
    openai: 'https://api.openai.com/v1/models'
  }
};

/**
 * Make HTTP request with timeout
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after ${config.timeout}ms`));
    }, config.timeout);

    const req = protocol.request(options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    req.end();
  });
}

/**
 * Check application endpoints
 */
async function checkEndpoints() {
  const results = [];
  
  for (const endpoint of config.endpoints) {
    const start = performance.now();
    
    try {
      const response = await makeRequest({
        hostname: config.host,
        port: config.port,
        path: endpoint,
        method: 'GET',
        headers: {
          'User-Agent': 'Bonsai-HealthCheck/1.0'
        }
      });
      
      const duration = performance.now() - start;
      
      results.push({
        endpoint,
        status: 'healthy',
        statusCode: response.statusCode,
        responseTime: Math.round(duration),
        healthy: response.statusCode >= 200 && response.statusCode < 400
      });
      
    } catch (error) {
      const duration = performance.now() - start;
      
      results.push({
        endpoint,
        status: 'unhealthy',
        error: error.message,
        responseTime: Math.round(duration),
        healthy: false
      });
    }
  }
  
  return results;
}

/**
 * Check external service connectivity
 */
async function checkExternalServices() {
  const results = [];
  
  for (const [service, url] of Object.entries(config.external)) {
    if (!url) continue;
    
    const start = performance.now();
    const urlObj = new URL(url);
    
    try {
      const response = await makeRequest({
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'HEAD',
        protocol: urlObj.protocol,
        headers: {
          'User-Agent': 'Bonsai-HealthCheck/1.0'
        }
      });
      
      const duration = performance.now() - start;
      
      results.push({
        service,
        status: 'reachable',
        statusCode: response.statusCode,
        responseTime: Math.round(duration),
        healthy: response.statusCode >= 200 && response.statusCode < 500
      });
      
    } catch (error) {
      const duration = performance.now() - start;
      
      results.push({
        service,
        status: 'unreachable',
        error: error.message,
        responseTime: Math.round(duration),
        healthy: false
      });
    }
  }
  
  return results;
}

/**
 * Check system resources
 */
function checkSystemResources() {
  const used = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      rss: Math.round(used.rss / 1024 / 1024), // MB
      heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
      external: Math.round(used.external / 1024 / 1024), // MB
      healthy: used.heapUsed < (512 * 1024 * 1024) // Less than 512MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
      healthy: true // Basic check - can be enhanced
    },
    uptime: {
      process: Math.round(process.uptime()),
      system: Math.round(require('os').uptime()),
      healthy: process.uptime() > 0
    }
  };
}

/**
 * Main health check function
 */
async function performHealthCheck() {
  const startTime = performance.now();
  
  console.log('🌱 Bonsai SAT Prep - Health Check Starting...');
  
  try {
    // Parallel health checks
    const [endpoints, external, system] = await Promise.all([
      checkEndpoints(),
      checkExternalServices(),
      Promise.resolve(checkSystemResources())
    ]);
    
    const totalTime = Math.round(performance.now() - startTime);
    
    // Determine overall health
    const endpointHealth = endpoints.every(e => e.healthy);
    const externalHealth = external.length === 0 || external.some(e => e.healthy);
    const systemHealth = system.memory.healthy && system.cpu.healthy && system.uptime.healthy;
    const overallHealth = endpointHealth && externalHealth && systemHealth;
    
    const result = {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      totalCheckTime: totalTime,
      checks: {
        endpoints: {
          status: endpointHealth ? 'healthy' : 'unhealthy',
          results: endpoints
        },
        external: {
          status: externalHealth ? 'healthy' : 'unhealthy',
          results: external
        },
        system: {
          status: systemHealth ? 'healthy' : 'unhealthy',
          results: system
        }
      }
    };
    
    // Output results
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Health Check Results:');
      console.log(JSON.stringify(result, null, 2));
    }
    
    // Exit codes for Docker health check
    if (overallHealth) {
      console.log('✅ All systems healthy');
      process.exit(0);
    } else {
      console.log('❌ Health check failed');
      console.error('Failed checks:', JSON.stringify(result.checks, null, 2));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Health check error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  performHealthCheck,
  checkEndpoints,
  checkExternalServices,
  checkSystemResources
};

// Run if called directly
if (require.main === module) {
  performHealthCheck();
}