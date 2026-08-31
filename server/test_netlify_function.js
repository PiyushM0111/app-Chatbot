// Test Netlify Serverless Function Handler Integration
import { handler } from '../netlify/functions/api.js';

const runNetlifyFunctionTest = async () => {
  console.log('================================================================');
  console.log('⚡ TESTING NETLIFY SERVERLESS FUNCTION HANDLER INTEGRATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASSED]  ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED]  ${testName} ${details ? `\n     → Reason: ${details}` : ''}`);
      failed++;
    }
  };

  // Helper to invoke serverless handler with API Gateway / Netlify event format
  const invokeEvent = async (path, httpMethod = 'GET', body = null, headers = {}) => {
    const event = {
      path,
      httpMethod,
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      queryStringParameters: {},
      body: body ? JSON.stringify(body) : null,
      isBase64Encoded: false
    };

    const context = {};
    const res = await handler(event, context);
    let parsedBody = null;
    try {
      parsedBody = JSON.parse(res.body);
    } catch (e) {
      parsedBody = res.body;
    }

    return {
      statusCode: res.statusCode,
      headers: res.headers || {},
      data: parsedBody,
      rawBody: res.body
    };
  };

  // 1. GET /health via Netlify Function rewrite (/.netlify/functions/api/health)
  const healthRes = await invokeEvent('/.netlify/functions/api/health', 'GET');
  assert(
    healthRes.statusCode === 200 &&
    healthRes.data.success === true &&
    healthRes.data.status === 'healthy',
    'Netlify Function 1: GET /health via /.netlify/functions/api/health returns 200 JSON healthy status',
    `Status: ${healthRes.statusCode}, Data: ${JSON.stringify(healthRes.data)}`
  );

  // 2. GET /api/health via Netlify Function rewrite (/.netlify/functions/api/api/health)
  const healthResWithApi = await invokeEvent('/.netlify/functions/api/api/health', 'GET');
  assert(
    healthResWithApi.statusCode === 200 &&
    healthResWithApi.data.success === true &&
    healthResWithApi.data.status === 'healthy',
    'Netlify Function 2: GET /api/health returns 200 JSON healthy status',
    `Status: ${healthResWithApi.statusCode}, Data: ${JSON.stringify(healthResWithApi.data)}`
  );

  // 3. POST /auth/guest via Netlify Function rewrite (/.netlify/functions/api/auth/guest)
  const guestRes = await invokeEvent('/.netlify/functions/api/auth/guest', 'POST', {});
  const guestToken = guestRes.data?.token;
  assert(
    guestRes.statusCode === 200 &&
    guestRes.data.success === true &&
    guestToken &&
    guestRes.data.user.name.startsWith('Guest_'),
    'Netlify Function 3: POST /auth/guest returns 200 JSON with guest session',
    `Status: ${guestRes.statusCode}, Data: ${JSON.stringify(guestRes.data)}`
  );

  // 4. GET /auth/me via Netlify Function with Bearer token
  const meRes = await invokeEvent('/.netlify/functions/api/auth/me', 'GET', null, {
    authorization: `Bearer ${guestToken}`
  });
  assert(
    meRes.statusCode === 200 &&
    meRes.data.success === true &&
    meRes.data.user.id === guestRes.data.user.id,
    'Netlify Function 4: GET /auth/me returns 200 JSON with authenticated user',
    `Status: ${meRes.statusCode}, Data: ${JSON.stringify(meRes.data)}`
  );

  // 5. POST /auth/signup via Netlify Function rewrite
  const testEmail = `netlify_splat_${Date.now()}@example.com`;
  const signupRes = await invokeEvent('/.netlify/functions/api/auth/signup', 'POST', {
    name: 'Netlify Tester',
    email: testEmail,
    password: 'Password123!'
  });
  assert(
    signupRes.statusCode === 201 &&
    signupRes.data.success === true &&
    signupRes.data.token &&
    signupRes.data.user.email === testEmail,
    'Netlify Function 5: POST /auth/signup returns 201 JSON with created user',
    `Status: ${signupRes.statusCode}, Data: ${JSON.stringify(signupRes.data)}`
  );

  // 6. POST /auth/login via Netlify Function rewrite
  const loginRes = await invokeEvent('/.netlify/functions/api/auth/login', 'POST', {
    email: testEmail,
    password: 'Password123!'
  });
  assert(
    loginRes.statusCode === 200 &&
    loginRes.data.success === true &&
    loginRes.data.token &&
    loginRes.data.user.email === testEmail,
    'Netlify Function 6: POST /auth/login returns 200 JSON with valid token',
    `Status: ${loginRes.statusCode}, Data: ${JSON.stringify(loginRes.data)}`
  );

  // 7. Invalid credentials via Netlify Function
  const invalidLoginRes = await invokeEvent('/.netlify/functions/api/auth/login', 'POST', {
    email: testEmail,
    password: 'WrongPassword!'
  });
  assert(
    invalidLoginRes.statusCode === 401 &&
    invalidLoginRes.data.success === false &&
    invalidLoginRes.data.error.includes('Invalid email or password'),
    'Netlify Function 7: POST /auth/login invalid credentials returns 401 JSON error',
    `Status: ${invalidLoginRes.statusCode}, Data: ${JSON.stringify(invalidLoginRes.data)}`
  );

  console.log('\n================================================================');
  console.log(`📊 NETLIFY FUNCTION TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runNetlifyFunctionTest().catch((err) => {
  console.error('Fatal Error testing Netlify Function:', err);
  process.exit(1);
});
