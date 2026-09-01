// End-to-End Authentication & Message Pipeline Test
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

const runE2EMessageAuthTest = async () => {
  console.log('================================================================');
  console.log('🧪 TESTING COMPLETE REAL-USER AUTHENTICATION & CHAT FLOW');
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

  const testEmail = `e2e_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'E2E Tester';

  // STEP 1: Signup
  const signupRes = await request('/api/auth/signup', 'POST', {
    name: testName,
    email: testEmail,
    password: testPassword
  });
  assert(
    signupRes.status === 201 && signupRes.data.token && signupRes.data.user.id,
    'Step 1: User sign-up succeeds and issues token'
  );
  let authToken = signupRes.data.token;
  let userId = signupRes.data.user.id;

  // STEP 2: Verify /api/auth/me immediately
  const meRes = await request('/api/auth/me', 'GET', null, authToken);
  assert(
    meRes.status === 200 && meRes.data.user?.id === userId,
    'Step 2: /api/auth/me validates newly issued session token'
  );

  // STEP 3: Create new conversation
  const convRes = await request('/api/conversations', 'POST', {
    title: 'E2E Chat Session'
  }, authToken);
  assert(
    convRes.status === 201 && convRes.data.conversation?.id,
    'Step 3: Authenticated conversation creation succeeds'
  );
  const conversationId = convRes.data.conversation.id;

  // STEP 4: Send "hi" and verify assistant response
  const msg1Res = await request(`/api/conversations/${conversationId}/messages`, 'POST', {
    content: 'hi',
    model: 'gemini-1.5-flash',
    stream: false
  }, authToken);
  assert(
    msg1Res.status === 200 && (msg1Res.data.aiMessage?.content || msg1Res.raw.includes('Hello')),
    'Step 4: Send message "hi" produces valid assistant response (NO 401 or blank)'
  );

  // STEP 5: Send second message "Can you tell me about cybersecurity?"
  const msg2Res = await request(`/api/conversations/${conversationId}/messages`, 'POST', {
    content: 'Can you tell me about cybersecurity?',
    model: 'gemini-1.5-flash',
    stream: false
  }, authToken);
  assert(
    msg2Res.status === 200 && (msg2Res.data.aiMessage?.content?.includes('Cybersecurity') || msg2Res.raw.includes('Cybersecurity')),
    'Step 5: Send follow-up prompt produces comprehensive AI response'
  );

  // STEP 6: Simulate page refresh & load conversation history
  const historyRes = await request(`/api/conversations/${conversationId}`, 'GET', null, authToken);
  assert(
    historyRes.status === 200 && historyRes.data.messages?.length >= 4,
    'Step 6: Refresh simulation: Conversation history loaded with all messages'
  );

  // STEP 7: Send another message in existing conversation
  const msg3Res = await request(`/api/conversations/${conversationId}/messages`, 'POST', {
    content: 'What is encryption?',
    model: 'gemini-1.5-flash',
    stream: false
  }, authToken);
  assert(
    msg3Res.status === 200 && (msg3Res.data.aiMessage?.content?.includes('Encryption') || msg3Res.raw.includes('Encryption')),
    'Step 7: Send message in refreshed conversation persists session'
  );

  // STEP 8: Create second conversation (switching conversations)
  const conv2Res = await request('/api/conversations', 'POST', {
    title: 'Second Conversation'
  }, authToken);
  const conversationId2 = conv2Res.data.conversation.id;
  const msg4Res = await request(`/api/conversations/${conversationId2}/messages`, 'POST', {
    content: 'Explain Python in one line',
    model: 'gemini-1.5-flash',
    stream: false
  }, authToken);
  assert(
    msg4Res.status === 200 && (msg4Res.data.aiMessage?.content || msg4Res.raw.includes('Python')),
    'Step 8: Multi-conversation switching works without session disruption'
  );

  // STEP 9: Logout & verify protected routes reject with 401
  const unauthRes = await request(`/api/conversations/${conversationId}/messages`, 'POST', {
    content: 'Should fail',
    stream: false
  }, null);
  assert(
    unauthRes.status === 401 && unauthRes.data.error.includes('Access token required'),
    'Step 9: Logout simulation: Unauthenticated request rejected with 401 JSON'
  );

  // STEP 10: Re-login with credentials and send message again
  const loginRes = await request('/api/auth/login', 'POST', {
    email: testEmail,
    password: testPassword
  });
  assert(
    loginRes.status === 200 && loginRes.data.token,
    'Step 10: Re-login succeeds with new token'
  );
  const reAuthToken = loginRes.data.token;

  const msg5Res = await request(`/api/conversations/${conversationId2}/messages`, 'POST', {
    content: 'Hello again!',
    model: 'gemini-1.5-flash',
    stream: false
  }, reAuthToken);
  assert(
    msg5Res.status === 200 && (msg5Res.data.aiMessage?.content || msg5Res.raw.includes('Hello')),
    'Step 11: Re-authenticated message sending succeeds seamlessly'
  );

  console.log('\n================================================================');
  console.log(`📊 E2E MESSAGE AUTH RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runE2EMessageAuthTest().catch((err) => {
  console.error('Fatal E2E Test Error:', err);
  process.exit(1);
});
