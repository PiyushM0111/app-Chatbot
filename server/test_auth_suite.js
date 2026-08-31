// Comprehensive Authentication & API Response Verification Suite
import http from 'http';
import { parseJsonResponse } from '../client/src/utils/apiClient.js';

const BASE_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode,
          contentType,
          data: parsed,
          raw: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runAuthSuite = async () => {
  console.log('================================================================');
  console.log('🔐 NEXUS AI COMPREHENSIVE AUTHENTICATION & ROUTING SUITE');
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

  const testEmail = `authtest_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Nexus Test User';

  // 1. Empty Fields on Signup
  const emptySignupRes = await request('/api/auth/signup', 'POST', { name: '', email: '', password: '' });
  assert(
    emptySignupRes.status === 400 &&
    emptySignupRes.contentType.includes('application/json') &&
    emptySignupRes.data.success === false &&
    !emptySignupRes.raw.includes('<!DOCTYPE'),
    'Auth Validation 1: Empty signup fields → 400 JSON error (no HTML)'
  );

  // 2. Successful Signup
  const signupRes = await request('/api/auth/signup', 'POST', { name: testName, email: testEmail, password: testPassword });
  assert(
    signupRes.status === 201 &&
    signupRes.contentType.includes('application/json') &&
    signupRes.data.success === true &&
    signupRes.data.token &&
    signupRes.data.user.email === testEmail &&
    !signupRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 2: Valid signup → 201 JSON with user & token'
  );

  // 3. Duplicate Email Signup
  const dupSignupRes = await request('/api/auth/signup', 'POST', { name: testName, email: testEmail, password: testPassword });
  assert(
    dupSignupRes.status === 400 &&
    dupSignupRes.contentType.includes('application/json') &&
    dupSignupRes.data.success === false &&
    dupSignupRes.data.error.includes('already exists') &&
    !dupSignupRes.raw.includes('<!DOCTYPE'),
    'Auth Validation 3: Duplicate signup → 400 JSON error'
  );

  // 4. Empty Fields on Login
  const emptyLoginRes = await request('/api/auth/login', 'POST', { email: '', password: '' });
  assert(
    emptyLoginRes.status === 400 &&
    emptyLoginRes.contentType.includes('application/json') &&
    emptyLoginRes.data.success === false &&
    !emptyLoginRes.raw.includes('<!DOCTYPE'),
    'Auth Validation 4: Empty login fields → 400 JSON error'
  );

  // 5. Invalid Email Login
  const badEmailRes = await request('/api/auth/login', 'POST', { email: 'nonexistent_user_999@example.com', password: testPassword });
  assert(
    badEmailRes.status === 401 &&
    badEmailRes.contentType.includes('application/json') &&
    badEmailRes.data.success === false &&
    badEmailRes.data.error.includes('Invalid email or password') &&
    !badEmailRes.raw.includes('<!DOCTYPE'),
    'Auth Validation 5: Invalid email login → 401 JSON error (no HTML)'
  );

  // 6. Invalid Password Login
  const badPassRes = await request('/api/auth/login', 'POST', { email: testEmail, password: 'WrongPassword999!' });
  assert(
    badPassRes.status === 401 &&
    badPassRes.contentType.includes('application/json') &&
    badPassRes.data.success === false &&
    badPassRes.data.error.includes('Invalid email or password') &&
    !badPassRes.raw.includes('<!DOCTYPE'),
    'Auth Validation 6: Invalid password login → 401 JSON error (no HTML)'
  );

  // 7. Successful Login
  const loginRes = await request('/api/auth/login', 'POST', { email: testEmail, password: testPassword });
  const authToken = loginRes.data.token;
  assert(
    loginRes.status === 200 &&
    loginRes.contentType.includes('application/json') &&
    loginRes.data.success === true &&
    authToken &&
    loginRes.data.user.email === testEmail &&
    !loginRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 7: Valid login → 200 JSON with user & token'
  );

  // 8. Instant Guest Login
  const guestRes = await request('/api/auth/guest', 'POST', {});
  assert(
    guestRes.status === 200 &&
    guestRes.contentType.includes('application/json') &&
    guestRes.data.success === true &&
    guestRes.data.token &&
    guestRes.data.user.name.startsWith('Guest_') &&
    !guestRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 8: Instant Guest login → 200 JSON with guest session'
  );

  // 9. Session Verification (/api/auth/me) with Token
  const meRes = await request('/api/auth/me', 'GET', null, authToken);
  assert(
    meRes.status === 200 &&
    meRes.contentType.includes('application/json') &&
    meRes.data.success === true &&
    meRes.data.user.email === testEmail &&
    !meRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 9: Session verification (/api/auth/me) → 200 JSON with user data'
  );

  // 10. Session Verification with Invalid Token
  const badTokenRes = await request('/api/auth/me', 'GET', null, 'invalid_token_xyz_123');
  assert(
    (badTokenRes.status === 401 || badTokenRes.status === 403) &&
    badTokenRes.contentType.includes('application/json') &&
    !badTokenRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 10: Invalid token verification → 401/403 JSON error (no HTML)'
  );

  // 11. Preferences Update (/api/auth/preferences)
  const prefRes = await request('/api/auth/preferences', 'PUT', { theme_preference: 'nebula', accentColor: '#8B5CF6' }, authToken);
  assert(
    prefRes.status === 200 &&
    prefRes.contentType.includes('application/json') &&
    prefRes.data.success === true &&
    !prefRes.raw.includes('<!DOCTYPE'),
    'Auth Workflow 11: Preferences update → 200 JSON response'
  );

  // 12. Non-existent API Route Returns JSON 404 (Not HTML index.html)
  const notFoundApiRes = await request('/api/nonexistent_route_test', 'GET');
  assert(
    notFoundApiRes.status === 404 &&
    notFoundApiRes.contentType.includes('application/json') &&
    notFoundApiRes.data.error &&
    !notFoundApiRes.raw.includes('<!DOCTYPE'),
    'Routing 12: Missing /api/* route returns 404 JSON (NOT HTML index.html)'
  );

  // 13. Frontend Safe JSON Parser Guard Validation
  let parserGuardPassed = false;
  try {
    const mockHtmlResponse = {
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'text/html' },
      text: async () => '<!DOCTYPE html><html lang="en"><head><title>Nexus AI</title></head><body><div id="root"></div></body></html>'
    };
    await parseJsonResponse(mockHtmlResponse);
  } catch (err) {
    parserGuardPassed = err.message.includes('API endpoint not reachable') && !err.message.includes('Unexpected token');
  }
  assert(
    parserGuardPassed,
    'Client Guard 13: parseJsonResponse converts HTML document into descriptive error without crashing with "Unexpected token <"'
  );

  console.log('\n================================================================');
  console.log(`📊 AUTHENTICATION SUITE RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runAuthSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
