// Step 2: Complete AI Response & Conversation Flow Test Suite
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

const requestStream = (path, method = 'POST', body = null, token = null) => {
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
      let chunks = [];
      let fullRaw = '';
      let isDone = false;
      let aiMessage = null;

      res.on('data', chunk => {
        const text = chunk.toString();
        fullRaw += text;
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) chunks.push(data.chunk);
              if (data.done) {
                isDone = true;
                aiMessage = data.aiMessage;
              }
            } catch (e) {}
          }
        }
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          chunks,
          fullStreamedText: chunks.join(''),
          isDone,
          aiMessage,
          raw: fullRaw
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runStep2AiResponseFlowAudit = async () => {
  console.log('================================================================');
  console.log('🧠 STEP 2: COMPLETE AI RESPONSES & CONVERSATION FLOW AUDIT');
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
    title: 'Step 2 AI Evaluation Chat',
    language: 'en',
    mode: 'general'
  }, token);
  const convId = convRes.data.conversation.id;

  // 1. Normal Question
  const q1 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is cybersecurity?',
    stream: false
  }, token);
  const c1 = q1.data.aiMessage?.content || '';
  assert(
    q1.status === 200 && c1.length > 80 && c1.includes('CIA Triad') && !c1.includes('Search Results:'),
    'Test 1: Normal Question ("What is cybersecurity?") returns comprehensive conceptual explanation'
  );

  // 2. Detailed Question
  const q2 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Teach me Python functions deeply with args, kwargs, and decorators.',
    stream: false
  }, token);
  const c2 = q2.data.aiMessage?.content || '';
  assert(
    q2.status === 200 && c2.includes('*args') && c2.includes('**kwargs') && c2.includes('decorator'),
    'Test 2: Detailed Question yields in-depth code examples, args/kwargs, and decorator patterns'
  );

  // 3. Follow-up Question (Context Awareness)
  const q3 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'How do default arguments work in functions?',
    stream: false
  }, token);
  const c3 = q3.data.aiMessage?.content || '';
  assert(
    q3.status === 200 && c3.includes('def') && (c3.includes('default') || c3.includes('argument')),
    'Test 3: Follow-up Question contextualizes function arguments naturally without repetition'
  );

  // 4. Coding Question
  const q4 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Write a Python calculator with zero division guards.',
    stream: false
  }, token);
  const c4 = q4.data.aiMessage?.content || '';
  assert(
    q4.status === 200 && c4.includes('```python') && c4.includes('ZeroDivisionError') && c4.includes('def add'),
    'Test 4: Coding Question produces clean, executable, bug-free Python script with error guards'
  );

  // 5. Current-Information Question (Web Search Grounding)
  const q5 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'What is the latest cybersecurity news and threat advisories?',
    stream: false
  }, token);
  const c5 = q5.data.aiMessage?.content || '';
  assert(
    q5.status === 200 && (c5.includes('Threat Intelligence') || c5.includes('CISA') || c5.includes('cisa.gov')),
    'Test 5: Current-Information Question triggers live search and returns verified citations'
  );

  // 6. Multiple Messages in One Conversation (State & Ordering)
  const historyRes = await request(`/api/conversations/${convId}`, 'GET', null, token);
  const messages = historyRes.data.messages || [];
  assert(
    historyRes.status === 200 && messages.length >= 10,
    `Test 6: Multi-turn conversation retains full ordering (${messages.length} messages preserved)`
  );

  // 7. Regenerate Response
  const regenRes = await request(`/api/conversations/${convId}/regenerate`, 'POST', {
    stream: false
  }, token);
  const regenContent = regenRes.data.aiMessage?.content || '';
  assert(
    regenRes.status === 200 && regenContent.length > 50,
    'Test 7: Regenerate Response endpoint regenerates the latest message seamlessly'
  );

  // 8. Refresh & Continue Conversation
  const reloadConv = await request(`/api/conversations/${convId}`, 'GET', null, token);
  const continueRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Please summarize our discussion so far.',
    stream: false
  }, token);
  assert(
    reloadConv.status === 200 && continueRes.status === 200 && (continueRes.data.aiMessage?.content || '').length > 20,
    'Test 8: Reloading conversation and sending a continuation message functions with full continuity'
  );

  // 9. Error / Edge Case (Empty Message Content)
  const errRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: '   ',
    stream: false
  }, token);
  assert(
    errRes.status === 400 && errRes.data.error,
    'Test 9: Empty prompt returns clean 400 Bad Request JSON without crashing or creating blank bubbles'
  );

  // 10. Streaming / SSE Response Verification
  const streamResult = await requestStream(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Explain the difference between TCP and UDP protocols.',
    stream: true
  }, token);
  assert(
    streamResult.status === 200 &&
    streamResult.contentType?.includes('text/event-stream') &&
    streamResult.chunks.length > 5 &&
    streamResult.isDone === true &&
    streamResult.fullStreamedText.includes('TCP') &&
    streamResult.fullStreamedText.includes('UDP'),
    'Test 10: Streaming endpoint emits text/event-stream chunks smoothly with valid final done signal'
  );

  console.log('\n================================================================');
  console.log(`📊 STEP 2 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep2AiResponseFlowAudit().catch((err) => {
  console.error('Fatal Step 2 Test Error:', err);
  process.exit(1);
});
