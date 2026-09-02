// Comprehensive Real-World Web Search & Intelligent Routing Suite
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
          raw: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runSearchRealWorldSuite = async () => {
  console.log('================================================================');
  console.log('🌐 TESTING INTELLIGENT WEB SEARCH & REAL-WORLD QUERY HANDLING');
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

  // Auth setup
  const guestRes = await request('/api/auth/guest', 'POST');
  const token = guestRes.data.token;

  // Create primary test conversation
  const convRes = await request('/api/conversations', 'POST', {
    title: 'Search & Real-World Test Session'
  }, token);
  const convId = convRes.data.conversation.id;

  // TEST 1: "What is cybersecurity?" (Normal AI knowledge - No web search)
  const q1 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is cybersecurity?',
    stream: false
  }, token);
  const content1 = q1.data.aiMessage?.content || '';
  assert(
    q1.status === 200 && content1.toLowerCase().includes('cybersecurity') && content1.includes('CIA Triad') && !content1.includes('Search Results:'),
    'Test 1: "What is cybersecurity?" → Normal AI response (No unnecessary web search)'
  );

  // TEST 2: "What is the latest cybersecurity news?" (Current/Live info → Web Search)
  const q2 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is the latest cybersecurity news?',
    stream: false
  }, token);
  const content2 = q2.data.aiMessage?.content || '';
  assert(
    q2.status === 200 && (content2.includes('Threat Intelligence') || content2.includes('CISA') || content2.includes('cisa.gov')),
    'Test 2: "What is the latest cybersecurity news?" → Web search with verified threat intelligence'
  );

  // TEST 3: "Find topics from SIH official website." (Website-specific → Web search + official SIH sources)
  const q3 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Find topics from SIH official website.',
    stream: false
  }, token);
  const content3 = q3.data.aiMessage?.content || '';
  assert(
    q3.status === 200 && (content3.includes('Smart Automation') || content3.includes('Clean & Green') || content3.includes('sih.gov.in')),
    'Test 3: "Find topics from SIH official website." → Web search with official SIH themes & sih.gov.in link'
  );

  // TEST 4: "Who is conducting this year's SIH?" (Current website/entity → Organizing bodies)
  const q4 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: "Who is conducting this year's SIH?",
    stream: false
  }, token);
  const content4 = q4.data.aiMessage?.content || '';
  assert(
    q4.status === 200 && (content4.includes('Ministry of Education') || content4.includes('AICTE') || content4.includes('MIC')),
    'Test 4: "Who is conducting this year\'s SIH?" → Returns MIC, AICTE, and Ministry of Education'
  );

  // TEST 5: "What is the latest SIH edition?" (Website-specific details)
  const q5 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is the latest SIH edition?',
    stream: false
  }, token);
  const content5 = q5.data.aiMessage?.content || '';
  assert(
    q5.status === 200 && (content5.includes('Senior') || content5.includes('Junior') || content5.includes('Software') || content5.includes('Hardware')),
    'Test 5: "What is the latest SIH edition?" → Details Senior/Junior, Software/Hardware editions'
  );

  // TEST 6 (Multi-Turn Context Follow-Up): "How many topics are there?" following SIH conversation
  const q6 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'How many topics are there?',
    stream: false
  }, token);
  const content6 = q6.data.aiMessage?.content || '';
  assert(
    q6.status === 200 && (content6.includes('Smart India Hackathon') || content6.includes('Problem Statement') || content6.includes('Theme Category') || content6.includes('sih.gov.in')),
    'Test 6: Context Follow-up: "How many topics are there?" → Recognizes SIH context and returns theme statistics'
  );

  // TEST 7: "Explain Python loops." (Normal educational AI)
  const q7 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Explain Python loops.',
    stream: false
  }, token);
  const content7 = q7.data.aiMessage?.content || '';
  assert(
    q7.status === 200 && (content7.includes('for') && content7.includes('while') && content7.includes('range')),
    'Test 7: "Explain Python loops." → Normal AI educational breakdown (for/while loops)'
  );

  // TEST 8: "Find the latest Python release." (Current technical release lookup)
  const q8 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Find the latest Python release.',
    stream: false
  }, token);
  const content8 = q8.data.aiMessage?.content || '';
  assert(
    q8.status === 200 && (content8.includes('Python 3.') || content8.includes('python.org')),
    'Test 8: "Find the latest Python release." → Web search with Python 3.12/3.13 and python.org citation'
  );

  // TEST 9: "Generate an image of a boy learning cybersecurity." (Image Studio Intent)
  const q9 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Generate an image of a boy learning cybersecurity.',
    stream: false
  }, token);
  const isImage9 = q9.data.aiMessage?.attachments?.some(a => a.type === 'image');
  assert(
    q9.status === 200 && isImage9,
    'Test 9: "Generate an image of a boy learning cybersecurity." → Image Generation result with attachment'
  );

  // TEST 10: "Write a Python calculator." (Coding response)
  const q10 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Write a Python calculator.',
    stream: false
  }, token);
  const content10 = q10.data.aiMessage?.content || '';
  assert(
    q10.status === 200 && content10.includes('```python') && (content10.includes('def add') || content10.includes('calculator')),
    'Test 10: "Write a Python calculator." → High-quality Python calculator script'
  );

  // TEST 11: Real-World Local Inquiry: "Find colleges offering BCA Cyber Security near Dehradun"
  const q11 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Find colleges offering BCA Cyber Security near Dehradun',
    stream: false
  }, token);
  const content11 = q11.data.aiMessage?.content || '';
  assert(
    q11.status === 200 && (content11.includes('Dehradun') && (content11.includes('Graphic Era') || content11.includes('UPES') || content11.includes('DIT'))),
    'Test 11: "Find colleges offering BCA Cyber Security near Dehradun" → Returns verified Dehradun institutions'
  );

  console.log('\n================================================================');
  console.log(`📊 WEB SEARCH & REAL-WORLD RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runSearchRealWorldSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
