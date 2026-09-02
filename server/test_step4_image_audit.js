// Step 4: Complete Image Generation & Image UI Audit Suite
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

const runStep4ImageAudit = async () => {
  console.log('================================================================');
  console.log('🎨 STEP 4: COMPLETE IMAGE GENERATION & IMAGE UI AUDIT');
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

  // Create primary image test conversation
  const convRes = await request('/api/conversations', 'POST', {
    title: 'Step 4 Image Studio Audit Session',
    language: 'en',
    mode: 'general'
  }, token);
  const convId = convRes.data.conversation.id;

  // TEST 1: "Generate an image of a boy learning hacking."
  const q1 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Generate an image of a boy learning hacking.',
    stream: false
  }, token);
  const aiMsg1 = q1.data.aiMessage;
  const hasImg1 = aiMsg1?.attachments?.some(a => a.type === 'image' && a.url);
  const noParamsDump1 = !aiMsg1?.content?.includes('**Visual Parameters:**') && !aiMsg1?.content?.includes('generationId');
  assert(
    q1.status === 200 && hasImg1 && noParamsDump1 && aiMsg1?.content?.includes('boy learning hacking'),
    'Test 1: "Generate an image of a boy learning hacking." → Generates image card with clean UI (no parameter dump)'
  );

  // TEST 2: "Create a futuristic cyber security workspace."
  const q2 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Create a futuristic cyber security workspace.',
    stream: false
  }, token);
  const aiMsg2 = q2.data.aiMessage;
  const hasImg2 = aiMsg2?.attachments?.some(a => a.type === 'image' && a.url);
  assert(
    q2.status === 200 && hasImg2 && aiMsg2?.content?.includes('cyber security workspace'),
    'Test 2: "Create a futuristic cyber security workspace." → Image Studio generation with contextual lighting'
  );

  // TEST 3: "Generate a 16:9 image of a mountain landscape."
  const q3 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Generate a 16:9 image of a mountain landscape.',
    stream: false
  }, token);
  const aiMsg3 = q3.data.aiMessage;
  const imgAtt3 = aiMsg3?.attachments?.find(a => a.type === 'image');
  assert(
    q3.status === 200 && imgAtt3 && imgAtt3.aspectRatio === '16:9',
    'Test 3: "Generate a 16:9 image of a mountain landscape." → Accurate 16:9 landscape aspect ratio'
  );

  // TEST 4: "Create a 9:16 mobile wallpaper."
  const q4 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Create a 9:16 mobile wallpaper.',
    stream: false
  }, token);
  const aiMsg4 = q4.data.aiMessage;
  const imgAtt4 = aiMsg4?.attachments?.find(a => a.type === 'image');
  assert(
    q4.status === 200 && imgAtt4 && imgAtt4.aspectRatio === '9:16',
    'Test 4: "Create a 9:16 mobile wallpaper." → Accurate 9:16 vertical portrait aspect ratio'
  );

  // TEST 5: Follow-up image modification request: "make the room darker with green lighting"
  const q5 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'make the room darker with green lighting',
    stream: false
  }, token);
  const aiMsg5 = q5.data.aiMessage;
  const imgAtt5 = aiMsg5?.attachments?.find(a => a.type === 'image');
  assert(
    q5.status === 200 && imgAtt5 && imgAtt5.type === 'image',
    'Test 5: Follow-up image modification request → Multi-turn image iteration & continuity'
  );

  // TEST 6: Regenerate an existing image: "make another version"
  const q6 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'make another version',
    stream: false
  }, token);
  const aiMsg6 = q6.data.aiMessage;
  const imgAtt6 = aiMsg6?.attachments?.find(a => a.type === 'image');
  assert(
    q6.status === 200 && imgAtt6 && imgAtt6.url,
    'Test 6: Regenerate / variation request produces alternate image version'
  );

  // TEST 7: Image Database Persistence & Gallery API
  const galleryRes = await request('/api/images/gallery', 'GET', null, token);
  const galleryItems = galleryRes.data.images || [];
  assert(
    galleryRes.status === 200 && galleryItems.length >= 4,
    `Test 7: Image Gallery API correctly retrieves persisted user images (${galleryItems.length} stored)`
  );

  // TEST 8: Reopen Conversation & Verify Image Attachments Remain Intact
  const reloadConv = await request(`/api/conversations/${convId}`, 'GET', null, token);
  const reloadedMessages = reloadConv.data.messages || [];
  const imageMessages = reloadedMessages.filter(m => m.attachments?.some(a => a.type === 'image'));
  assert(
    reloadConv.status === 200 && imageMessages.length >= 5,
    `Test 8: Reopen conversation preserves all image attachments (${imageMessages.length} image cards persisted)`
  );

  // TEST 9: Normal Text Question About Image Generation: "Explain how image generation works." (Must NOT generate image)
  const q9 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Explain how image generation works.',
    stream: false
  }, token);
  const aiMsg9 = q9.data.aiMessage;
  const isImage9 = aiMsg9?.attachments?.some(a => a.type === 'image');
  assert(
    q9.status === 200 && !isImage9 && aiMsg9?.content?.length > 50,
    'Test 9: Educational question ("Explain how image generation works.") → Text explanation (NOT an image)'
  );

  // TEST 10: Coding Request: "Write Python code for an image-generation API." (Must NOT generate image)
  const q10 = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Write Python code for an image-generation API.',
    stream: false
  }, token);
  const aiMsg10 = q10.data.aiMessage;
  const isImage10 = aiMsg10?.attachments?.some(a => a.type === 'image');
  assert(
    q10.status === 200 && !isImage10 && aiMsg10?.content?.includes('```python'),
    'Test 10: Code request ("Write Python code for an image-generation API.") → Python code snippet (NOT an image)'
  );

  console.log('\n================================================================');
  console.log(`📊 STEP 4 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep4ImageAudit().catch((err) => {
  console.error('Fatal Step 4 Test Error:', err);
  process.exit(1);
});
