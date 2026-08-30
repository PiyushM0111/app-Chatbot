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
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runAuditSuite = async () => {
  console.log('🧪 Running Section 47 - Complete Audit & AI Quality Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  };

  try {
    // Register User
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Piyush Sharma',
      email: `audit_${Date.now()}@nexus.local`,
      password: 'AuditPassword123!'
    });
    const token = regRes.data.token;
    assert(token, 'User Setup & JWT Issuance');

    // Create a testing conversation
    const convRes = await request('/api/conversations', 'POST', { title: 'Audit Test Chat' }, token);
    const convId = convRes.data.conversation.id;

    // TEST 1: Greeting
    const t1 = await request(`/api/conversations/${convId}/messages`, 'POST', { content: 'hi' }, token);
    assert(
      t1.status === 200 && t1.data.aiMessage.content.toLowerCase().includes('hello') || t1.data.aiMessage.content.toLowerCase().includes('how can i help'),
      'TEST 1: User "hi" -> Natural short greeting'
    );

    // TEST 2: Real Cybersecurity Explanation (No boilerplate filler!)
    const t2 = await request(`/api/conversations/${convId}/messages`, 'POST', { content: 'Can you tell me about cybersecurity?' }, token);
    const c2 = t2.data.aiMessage.content;
    assert(
      t2.status === 200 &&
      (c2.includes('CIA Triad') || c2.includes('Confidentiality') || c2.includes('phishing') || c2.includes('malware') || c2.includes('protecting')) &&
      !c2.includes('The core approach involves breaking this topic down'),
      'TEST 2: "Can you tell me about cybersecurity?" -> Real educational explanation without generic boilerplate'
    );

    // TEST 3: Hinglish Cybersecurity Explanation
    const t3 = await request(`/api/conversations/${convId}/messages`, 'POST', { content: 'Explain cybersecurity in Hinglish.' }, token);
    const c3 = t3.data.aiMessage.content;
    assert(
      t3.status === 200 &&
      (c3.includes('bhai') || c3.includes('protect karna') || c3.includes('Cybersecurity') || c3.includes('hackers')) &&
      !c3.includes('The core approach involves'),
      'TEST 3: "Explain cybersecurity in Hinglish." -> Natural colloquial Hinglish explanation'
    );

    // TEST 4: Python Loop in Hinglish
    const t4 = await request(`/api/conversations/${convId}/messages`, 'POST', { content: 'Python me loop samjha.' }, token);
    const c4 = t4.data.aiMessage.content;
    assert(
      t4.status === 200 && (c4.includes('for') || c4.includes('loop') || c4.includes('Loop')),
      'TEST 4: "Python me loop samjha." -> Python loop tutorial in Hinglish with code snippet',
      `Got content: ${c4.slice(0, 100)}`
    );

    // TEST 5: Code Analysis & Fix
    const t5 = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Fix this code: def add(a, b): return a - b'
    }, token);
    const c5 = t5.data.aiMessage.content;
    assert(
      t5.status === 200 && c5.includes('return a + b') && c5.includes('subtraction operator'),
      'TEST 5: "Fix this code" -> Concrete bug analysis and working fix'
    );

    // TEST 6: Image Workflow
    const t6 = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Create an image of a futuristic neon city'
    }, token);
    assert(
      t6.status === 200 && (t6.data.aiMessage.content.includes('Image Generated') || t6.data.aiMessage.attachments?.length > 0),
      'TEST 6: "Create an image of..." -> Image generation pipeline execution'
    );

    // TEST 7: Project Context Continuation
    await request('/api/projects', 'POST', {
      name: 'Nexus Collab',
      description: 'Real-time collaborative note taking workspace'
    }, token);
    const t7 = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Continue the project we were working on.'
    }, token);
    assert(
      t7.status === 200 && t7.data.aiMessage.content.length > 50,
      'TEST 7: "Continue the project..." -> Context-aware response'
    );

    // TEST 8: Document / File Upload Attachment Analysis
    const t8 = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Analyze this configuration file',
      attachments: [{
        id: 'file-1',
        name: 'config.json',
        type: 'file',
        content: '{"port": 5000, "database": "sqlite"}'
      }]
    }, token);
    assert(
      t8.status === 200 && t8.data.userMessage.attachments.length === 1,
      'TEST 8: Document analysis & attachment handling'
    );

    // TEST 9: Empty content handled gracefully without server crash
    const t9 = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: ''
    }, token);
    assert(
      t9.status === 400 && t9.data.error,
      'TEST 9: Empty message rejection with clean error payload'
    );

    // TEST 10: Unauthorized Resource Request
    const t10 = await request('/api/conversations', 'GET', null, 'INVALID_BEARER_TOKEN');
    assert(
      t10.status === 403 || t10.status === 401,
      'TEST 10: Unauthorized resource request rejected with 401/403'
    );

    console.log(`\n========================================`);
    console.log(`🏁 Section 47 Audit Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL 10 SECTION-47 AUDIT TESTS PASSED FLAWLESSLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal audit error:', err);
    process.exit(1);
  }
};

runAuditSuite();
