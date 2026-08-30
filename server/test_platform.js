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

const runAllTests = async () => {
  console.log('🧪 Starting Nexus AI Platform Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health Check endpoint is active');

    // 2. Auth: Register / Login Test User
    const testEmail = `test_${Date.now()}@nexus.local`;
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Platform Tester',
      email: testEmail,
      password: 'StrongPassword123!'
    });
    assert(regRes.status === 201 && regRes.data.token, 'User Registration & JWT issuance');
    const token = regRes.data.token;

    // 3. Memory API Tests
    const saveMemRes = await request('/api/memory', 'POST', { keyFact: 'I prefer Python and FastAPI backend architectures.' }, token);
    assert(saveMemRes.status === 201 && saveMemRes.data.memory.keyFact.includes('FastAPI'), 'Memory creation');
    const memId = saveMemRes.data.memory.id;

    const listMemRes = await request('/api/memory', 'GET', null, token);
    assert(listMemRes.status === 200 && listMemRes.data.memories.length >= 1, 'Memory retrieval');

    const delMemRes = await request(`/api/memory/${memId}`, 'DELETE', null, token);
    assert(delMemRes.status === 200, 'Memory deletion');

    // 4. Projects API Tests
    const createProjRes = await request('/api/projects', 'POST', {
      name: 'Attendance Portal',
      description: 'Smart biometric & geo-fenced attendance tracking system'
    }, token);
    assert(createProjRes.status === 201 && createProjRes.data.project.tech_stack.length > 0, 'Project scaffolding generation');
    const projId = createProjRes.data.project.id;

    const listProjRes = await request('/api/projects', 'GET', null, token);
    assert(listProjRes.status === 200 && listProjRes.data.projects.length >= 1, 'Project list retrieval');

    // 5. Learning & Quiz API Tests
    const topicsRes = await request('/api/learning/topics', 'GET', null, token);
    assert(topicsRes.status === 200 && topicsRes.data.curriculum.python, 'Learning curriculum retrieval');

    const quizRes = await request('/api/learning/quiz', 'POST', { topic: 'python' }, token);
    assert(quizRes.status === 200 && quizRes.data.quiz.questions.length >= 3, 'Quiz generation');

    const evalRes = await request('/api/learning/evaluate', 'POST', {
      topic: 'python',
      answers: [1, 2, 1]
    }, token);
    assert(evalRes.status === 200 && evalRes.data.evaluation.percentage === 100, 'Quiz evaluation (100% score)');

    // 6. Multimodal Images API Tests
    const imgGenRes = await request('/api/images/generate', 'POST', {
      prompt: 'A cybernetic owl perching in a neon Tokyo skyline'
    }, token);
    assert(imgGenRes.status === 201 && imgGenRes.data.image.image_url, 'Image generation & parameter structuring');

    const imgListRes = await request('/api/images', 'GET', null, token);
    assert(imgListRes.status === 200 && imgListRes.data.images.length >= 1, 'Image gallery history');

    // 7. Conversation & Chat Tool Routing Tests
    const convRes = await request('/api/conversations', 'POST', { title: 'Test Chat' }, token);
    const convId = convRes.data.conversation.id;

    // Test Calculation tool in chat
    const calcMsg = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'what is 25% of 400'
    }, token);
    assert(calcMsg.status === 200 && calcMsg.data.aiMessage.content.includes('100'), 'Chat Calculator tool execution (25% of 400 = 100)');

    // Test Memory tool in chat
    const memMsg = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Remember that my favorite framework is Next.js'
    }, token);
    assert(memMsg.status === 200 && memMsg.data.aiMessage.content.includes('Memory Saved'), 'Chat Memory tool execution');

    // Test Emotion safeguard in chat (Not treating emotion as name)
    const emoMsg = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: "I'm sad"
    }, token);
    assert(
      emoMsg.status === 200 &&
      !emoMsg.data.aiMessage.content.includes('sad!') &&
      emoMsg.data.aiMessage.content.toLowerCase().includes('sorry'),
      'Emotion detection safeguard ("I\'m sad" acknowledged with empathy, not as name)'
    );

    console.log(`\n========================================`);
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL SUITES PASSED PERFECTLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runAllTests();
