// Step 1: Complete Authentication & Session Verification Test Suite
import http from 'http';

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
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode,
          data: parsed,
          headers: res.headers,
          raw: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runStep1AuthSessionAudit = async () => {
  console.log('================================================================');
  console.log('🔐 STEP 1: COMPLETE AUTHENTICATION & SESSION PERSISTENCE AUDIT');
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

  const testEmail = `step1_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Nexus Test User';

  // 1. Test Signup
  const signupRes = await request('/api/auth/signup', 'POST', {
    name: testName,
    email: testEmail,
    password: testPassword
  });
  assert(
    signupRes.status === 201 && signupRes.data.success && signupRes.data.token && signupRes.data.user?.id,
    'Requirement 1A: User Signup creates account and returns valid JWT token'
  );

  const initialToken = signupRes.data.token;
  const initialUserId = signupRes.data.user.id;

  // 1B. Test Login
  const loginRes = await request('/api/auth/login', 'POST', {
    email: testEmail,
    password: testPassword
  });
  assert(
    loginRes.status === 200 && loginRes.data.success && loginRes.data.token && loginRes.data.user?.id === initialUserId,
    'Requirement 1B: User Login verifies credentials and returns matching user profile'
  );

  const token = loginRes.data.token;

  // 2. Refresh / Session Verification (/api/auth/me)
  const sessionRes = await request('/api/auth/me', 'GET', null, token);
  assert(
    sessionRes.status === 200 && sessionRes.data.success && sessionRes.data.user?.email === testEmail,
    'Requirement 2: Page Refresh / Session Verification (/api/auth/me) restores user'
  );

  // 3. Create a New Conversation
  const createConvRes = await request('/api/conversations', 'POST', {
    title: 'Nexus Session Test Chat',
    language: 'en',
    mode: 'general'
  }, token);
  assert(
    createConvRes.status === 201 && createConvRes.data.success && createConvRes.data.conversation?.id,
    'Requirement 3: Create new conversation session under authenticated user'
  );

  const convId = createConvRes.data.conversation.id;

  // 4 & 5. Send Multiple Messages & Verify Assistant Responses
  const msg1Res = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Hello Nexus, tell me about Python programming.',
    stream: false
  }, token);
  const msg1Ai = msg1Res.data.aiMessage?.content || '';
  assert(
    msg1Res.status === 200 && msg1Ai.length > 50 && msg1Ai.toLowerCase().includes('python'),
    'Requirement 4 & 5A: Message 1 processed successfully with detailed assistant response'
  );

  const msg2Res = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Explain Python loops in simple terms.',
    stream: false
  }, token);
  const msg2Ai = msg2Res.data.aiMessage?.content || '';
  assert(
    msg2Res.status === 200 && msg2Ai.length > 50 && msg2Ai.includes('for') && msg2Ai.includes('while'),
    'Requirement 4 & 5B: Message 2 processed with context and valid response (no blank bubble)'
  );

  // 6. Logout & Login again
  const unauthRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Unauthenticated prompt attempt'
  }, null);
  assert(
    unauthRes.status === 401,
    'Requirement 6A: Logout simulation rejects unauthenticated requests with 401'
  );

  const reloginRes = await request('/api/auth/login', 'POST', {
    email: testEmail,
    password: testPassword
  });
  assert(
    reloginRes.status === 200 && reloginRes.data.token,
    'Requirement 6B: Re-login issues fresh valid JWT token'
  );

  const newToken = reloginRes.data.token;

  // 7. Verify Old Conversations & Messages Still Work
  const convHistoryRes = await request(`/api/conversations/${convId}`, 'GET', null, newToken);
  assert(
    convHistoryRes.status === 200 && convHistoryRes.data.messages?.length >= 4,
    'Requirement 7A: Retrieve conversation history after re-login restores all past messages'
  );

  const msg3Res = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Can you summarize our conversation?',
    stream: false
  }, newToken);
  const msg3Ai = msg3Res.data.aiMessage?.content || '';
  assert(
    msg3Res.status === 200 && msg3Ai.length > 20,
    'Requirement 7B: Send message in restored conversation succeeds seamlessly'
  );

  // 8. Expired & Tampered Token Handling
  const tamperedTokenRes = await request('/api/auth/me', 'GET', null, 'invalid.tampered.token');
  assert(
    tamperedTokenRes.status === 403,
    'Requirement 8: Tampered/invalid token cleanly rejected with 403 JSON (no crash)'
  );

  console.log('\n================================================================');
  console.log(`📊 STEP 1 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep1AuthSessionAudit().catch((err) => {
  console.error('Fatal Step 1 Test Error:', err);
  process.exit(1);
});
