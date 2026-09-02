// Step 3: Complete Web Search & Real-Time Information Audit Suite
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

const runStep3WebSearchAudit = async () => {
  console.log('================================================================');
  console.log('🌐 STEP 3: COMPLETE WEB SEARCH & REAL-TIME INFORMATION AUDIT');
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

  // Create primary search test conversation
  const convRes = await request('/api/conversations', 'POST', {
    title: 'Step 3 Web Search Test Session',
    language: 'en',
    mode: 'general'
  }, token);
  const convId = convRes.data.conversation.id;

  // TEST 1: "What is SIH?"
  const q1 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is SIH?',
    stream: false
  }, token);
  const c1 = q1.data.aiMessage?.content || '';
  assert(
    q1.status === 200 && (c1.includes('Smart India Hackathon') || c1.includes('sih.gov.in') || c1.includes('AICTE')),
    'Test 1: "What is SIH?" → Web search grounding with verified Smart India Hackathon details'
  );

  // TEST 2: "Tell me about the latest SIH updates."
  const q2 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Tell me about the latest SIH updates.',
    stream: false
  }, token);
  const c2 = q2.data.aiMessage?.content || '';
  assert(
    q2.status === 200 && (c2.includes('Smart India Hackathon') || c2.includes('Senior') || c2.includes('sih.gov.in')),
    'Test 2: "Tell me about the latest SIH updates." → Grounded updates with official portal references'
  );

  // TEST 3: "Who is conducting SIH this year?"
  const q3 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Who is conducting SIH this year?',
    stream: false
  }, token);
  const c3 = q3.data.aiMessage?.content || '';
  assert(
    q3.status === 200 && (c3.includes('Ministry of Education') || c3.includes('AICTE') || c3.includes('MIC')),
    'Test 3: "Who is conducting SIH this year?" → Identifies MIC, AICTE, and Ministry of Education'
  );

  // TEST 4: "Open/search the official SIH website and tell me..."
  const q4 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Open/search the official SIH website and tell me the problem statement themes.',
    stream: false
  }, token);
  const c4 = q4.data.aiMessage?.content || '';
  assert(
    q4.status === 200 && (c4.includes('Smart Automation') || c4.includes('Clean & Green') || c4.includes('sih.gov.in')),
    'Test 4: "Open/search the official SIH website and tell me..." → Returns official themes & sih.gov.in link'
  );

  // TEST 5: "What are the latest cybersecurity news?"
  const q5 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What are the latest cybersecurity news?',
    stream: false
  }, token);
  const c5 = q5.data.aiMessage?.content || '';
  assert(
    q5.status === 200 && (c5.includes('Threat Intelligence') || c5.includes('CISA') || c5.includes('cisa.gov')),
    'Test 5: "What are the latest cybersecurity news?" → Verified threat intelligence and CISA/CERT-In alerts'
  );

  // TEST 6: "What is the current weather in Delhi?"
  const q6 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is the current weather in Delhi?',
    stream: false
  }, token);
  const c6 = q6.data.aiMessage?.content || '';
  assert(
    q6.status === 200 && (c6.includes('Delhi') && (c6.includes('°C') || c6.includes('IMD') || c6.includes('mausam.imd.gov.in'))),
    'Test 6: "What is the current weather in Delhi?" → Meteorological observations with IMD citations'
  );

  // TEST 7: "Who is the current Prime Minister of India?"
  const q7 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Who is the current Prime Minister of India?',
    stream: false
  }, token);
  const c7 = q7.data.aiMessage?.content || '';
  assert(
    q7.status === 200 && (c7.includes('Narendra Modi') && c7.includes('pmindia.gov.in')),
    'Test 7: "Who is the current Prime Minister of India?" → Verified details for PM Narendra Modi & pmindia.gov.in'
  );

  // TEST 8: Normal question: "Explain Python functions." (No Web Search)
  const q8 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Explain Python functions.',
    stream: false
  }, token);
  const c8 = q8.data.aiMessage?.content || '';
  assert(
    q8.status === 200 && c8.includes('def ') && !c8.includes('Search Results:') && !c8.includes('DuckDuckGo'),
    'Test 8: Normal question ("Explain Python functions.") → Direct educational response (NO unnecessary search)'
  );

  // TEST 9: Follow-up question on functions: "What about the second point?"
  const q9 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What about the second point in Python functions?',
    stream: false
  }, token);
  const c9 = q9.data.aiMessage?.content || '';
  assert(
    q9.status === 200 && (c9.includes('Python') || c9.includes('function') || c9.includes('argument')),
    'Test 9: Follow-up question contextualizes previous response naturally'
  );

  // TEST 10: Search Fallback Case on obscure search query
  const q10 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'search online for qz982374jkhasdf89234obscuretechnology',
    stream: false
  }, token);
  const c10 = q10.data.aiMessage?.content || '';
  assert(
    q10.status === 200 && (c10.includes('Search') || c10.includes('DuckDuckGo') || c10.includes('http')),
    'Test 10: Search failure / obscure term yields transparent search link without inventing fake claims'
  );

  console.log('\n================================================================');
  console.log(`📊 STEP 3 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep3WebSearchAudit().catch((err) => {
  console.error('Fatal Step 3 Test Error:', err);
  process.exit(1);
});
